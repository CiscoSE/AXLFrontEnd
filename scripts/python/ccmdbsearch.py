# -*- coding: utf-8 -*-
import requests
import sys
import json

from pymongo import MongoClient
from pprint import pprint
from bson.objectid import ObjectId

import xml.etree.ElementTree as ET
import xml.dom.minidom

requests.packages.urllib3.disable_warnings()

"""
Self contained module to search CUCM's db for entry.  Place a relatively unique string
into a GUI field in CUCM and this script will attempt to find it.  The script will
provide the table row entry information.
"""

class Cluster(object):
    def __init__(self, cucmversion = '11.5', cucmpubip = '10.122.47.226', cucmaxluser = 'ccmadministrator', cucmpassword = 'cisc0lab'):
        """
        identifier (string): The name of the cluster - commonly the cluster ID
        cucmversion (string): The version number of the cluster - ie 11.5
        cucmpubip (string): The ip address of the publisher
        cucmaxluser (string): The axl application username
        cucmpassword (string): The password for the axl user
        """

        self.cucmversion = cucmversion
        self.pubip = cucmpubip
        self.cucmaxluser = cucmaxluser
        self.cucmpassword = cucmpassword
    
    def getVersion(self):
        return self.cucmversion
        
    def getAXLInfo(self):
        """
        Return: AXL username in password in a tuple of two strings (username, password)
        """
        return (self.cucmaxluser, self.cucmpassword)            
                                        
    def setPublisherIP(self, pubip):
        self.pubip = pubip
        
    def getPublisherIP(self):
        return self.pubip

class Database(object):
    def __init__(self, databaseip = 'localhost', databaseport = 27017):

        """
        databaseip (string): The ip of the database connection
        databaseport (number): The port of the database connection
        collection (?): The name of the database collection to connect to
        """

        self.databaseip = databaseip
        self.databaseport = databaseport

    def createConnection(self):
        client = MongoClient('localhost',27017)
        self.db=client.ccmdbsearch

    def updateDbRecord(self, mongoId, recordField, updateData):
        
        self.db.results.update_one({'_id' : ObjectId(mongoId)}, {'$set' : {recordField : updateData}}, upsert=False)


class AXL(object):
    """Abstract class for an AXL request/response object"""
    def __init__(self, cluster, axlelement):
        """
        axlelement: The AXL function that we're calling - ex listPhones
        cluster: A cluster object
        
        """
        self.cluster = cluster
        self.axlelement = axlelement
        self.soapheaders = {'Content-type':'text/xml', 'SOAPAction':'CUCM:DB ver=11.5 ' + axlelement}
        
    def runAXLRequest(self, printrequest = False, printresponse = False):    
        self.AXLRequest = requests.post('https://'+ self.cluster.getPublisherIP() +':8443/axl/', data = self.soaprequest, headers = self.soapheaders, verify = False, auth=(self.cluster.getAXLInfo()[0], self.cluster.getAXLInfo()[1]))
        
        self.root = ET.fromstring(self.AXLRequest.text)
        
        if printrequest:
            self.printAXLRequest()
            
        if printresponse:
            self.printAXLResponse()

        return self.root
    
    def printAXLRequest(self):
        print 'REQUEST'
        reparsed = xml.dom.minidom.parseString(self.soaprequest)
        print reparsed.toprettyxml(indent='\t')
                
    def printAXLResponse(self):    
        print 'RESPONSE'
        rootstring = ET.tostring(self.root, 'utf-8')
        reparsed = xml.dom.minidom.parseString(rootstring)
        print reparsed.toprettyxml(indent='\t')

class AXLExecuteRequest(AXL):
    def __init__(self, cluster, axlelement, query):
        AXL.__init__(self, cluster, axlelement)   
        self.query = query 
        self.soaprequest = '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ns="http://www.cisco.com/AXL/API/'+ self.cluster.getVersion() +'"><soapenv:Header /><soapenv:Body><ns:'+ self.axlelement +'><sql>' + self.query + '</sql></ns:'+ self.axlelement +'></soapenv:Body></soapenv:Envelope>'

def querybuilder(table, columns, testval):
    """
    Creates the SQL query
    table (string): the CUCM table name for SQL FROM
    columns (list): a list of columns in the table
    testval (string): the value that is being searched for
    
    Return (string): the SQL query
    """  

    #orstate is a flag to ensure that "OR" is added in after the first column clause
    orstate = ''
   
    for column in columns:
        if orstate == '':
            orstate = column + ' = ' + '"' + testval + '"'
        else:
            orstate += ' OR ' + column + ' = ' + '"' + testval + '"'
                
    return 'SELECT * FROM ' + table + ' WHERE ' + orstate

def findFault(table, coltypes, testval):
    """
    Some AXL query's will fail due to a issue in type - this seeks to resolve those issues
    table (string): the CUCM table name for SQL FROM
    coltypes (list of tuples of strings): a list of tuples of (column, type)
    testval (string): the value that is being searched for
    
    Return (list): new columns whose types won't error
    """  
    newcolumn = []
    typelist = []
    badlist = []

    #Take each item in coltypes and create a non-duplicative list of types - AXL test each type to see which fail and append to badlist
    for value in coltypes:
        if value[1] not in typelist:
            typelist.append(value[1])
            testquery = AXLExecuteRequest(cluster, 'executeSQLQuery', 'SELECT * FROM ' + table + ' WHERE ' + value[0] + ' = ' + '"' + testval + '"')
            testroot = testquery.runAXLRequest()
            if 'Fault' in testroot[0][0].tag:                            
                badlist.append(value[1])
    
    #Take the columns that aren't in badlist and append to newcolumn list
    for value in coltypes:
        if value[1] not in badlist:
            newcolumn.append(value[0])      
        
    return newcolumn 
                                                           
def finddbentry(testval, cluster):
    """
    First creates 
    """

    #Find each column in each table - row with tabname, colname as tags
    dbcreatequery = 'SELECT tabname, syscolumns.tabid, colname, coltype FROM syscolumns LEFT JOIN systables ON syscolumns.tabid = systables.tabid'    
    request = AXLExecuteRequest(cluster, 'executeSQLQuery', dbcreatequery)    
    
    root = request.runAXLRequest()

    dbdict = {}
    founddict = {}
    tabid = {}
    log = {}

    # Collect all rows and create a dict with table as key and columns as list of values
    for item in root.iter('row'):
        
        
        tabname = item.find('tabname').text
        tabid = item.find('tabid').text
        colname = item.find('colname').text
        coltype = item.find('coltype').text
        tabkey = (tabname, tabid)

        # Remove the IF
        if (tabname == 'device') or (tabname == 'vs_view'):
            if tabkey not in dbdict:
                dbdict[tabkey] = [(colname, coltype)]
            else:
                dbdict[tabkey].append((colname, coltype))         

    #Create the WHERE clause based on building an "OR" for each column to test value presence
    for tabkey in dbdict:
        # print 'Checking', tabkey[0]
        table = tabkey[0]
        columns = []
        #pull the column names out of each dbdict entry
        for value in dbdict[tabkey]:
            columns.append(value[0])

        query = querybuilder(table, columns, testval)        
        filterquery = AXLExecuteRequest(cluster, 'executeSQLQuery', query)            
        root = filterquery.runAXLRequest()    
            
        #if there's a problem with the AXL responses for that table try and find the offending column    
        if 'Fault' in root[0][0].tag:
            for item in root.iter('axlError'):
                for error in item:
                    axlcode = item.find('axlcode').text
                    axlmessage = item.find('axlmessage').text
                    request = item.find('request').text
            newcolumns = findFault(table, dbdict[tabkey], testval)           
       
            #rerun the AXL request with a query containing only the columns that yield good data
            query = querybuilder(table, newcolumns, testval)   
            filterquery = AXLExecuteRequest(cluster, 'executeSQLQuery', query)            
            root = filterquery.runAXLRequest()               
                
            log[table] = (axlcode, axlmessage)         
        
        #root should now have info despite any type errors we can move on
        count = 0
        
        for item in root.iter('row'):
            count += 1     
            if table not in founddict:
                recorddict = {}
                recorddict[str(count)] = {}
                founddict[table] = recorddict
            else:
                recorddict[str(count)] = {}
                founddict[table].update(recorddict[str(count)])        
            
            for i in item:
                recorddict[str(count)].update({i.tag: i.text})
    return founddict    

if __name__ == '__main__':   
    
    # cluster = Cluster()
    # testval = 'pickle'
    # testfound = finddbentry(testval, cluster)

    # Create the database connection
    db = Database('localhost', 27017)
    db.createConnection()


    if len(sys.argv) == 3:
        cluster = Cluster()
        mongoId = sys.argv[1] 
        testval = sys.argv[2]
        sys.stdout.flush()
        testfound = json.dumps(finddbentry(testval, cluster))

    elif len(sys.argv) == 5:
        cluster = Cluster(sys.argv[1], sys.argv[2], sys.argv[3], sys.argv[4])
        testval = sys.argv[5]
        testfound = json.dumps(finddbentry(testval, cluster))
        
    else:
        testfound = "Error: Number of arguments is incorrect"
    
    # Populate the database with the 
    db.updateDbRecord(mongoId, 'blob', testfound)


    # getme = db.results.find_one({'_id' : ObjectId('5c42020cb11aa54f851e9e68')})
    # print(getme)

    # pprint(db.results.find_one())

    
    # print(str(test.modified_count))

    # pprint(test)

    # for key in testfound:
    #     print testfound[key]    

# ---------------------------------------------

# # -*- coding: utf-8 -*-
# import requests
# import sys
# import json

# from pymongo import MongoClient
# from pprint import pprint
# from bson.objectid import ObjectId

# import xml.etree.ElementTree as ET
# import xml.dom.minidom

# requests.packages.urllib3.disable_warnings()

# """
# Self contained module to search CUCM's db for entry.  Place a relatively unique string
# into a GUI field in CUCM and this script will attempt to find it.  The script will
# provide the table row entry information.
# """

# client = MongoClient('localhost',27017)
# db=client.ccmdbsearch


# class Cluster(object):
#     def __init__(self, cucmversion = '11.5', cucmpubip = '10.122.47.226', cucmaxluser = 'ccmadministrator', cucmpassword = 'cisc0lab'):
#         """
#         identifier (string): The name of the cluster - commonly the cluster ID
#         cucmversion (string): The version number of the cluster - ie 11.5
#         cucmpubip (string): The ip address of the publisher
#         cucmaxluser (string): The axl application username
#         cucmpassword (string): The password for the axl user
#         """

#         self.cucmversion = cucmversion
#         self.pubip = cucmpubip
#         self.cucmaxluser = cucmaxluser
#         self.cucmpassword = cucmpassword
    
#     def getVersion(self):
#         return self.cucmversion
        
#     def getAXLInfo(self):
#         """
#         Return: AXL username in password in a tuple of two strings (username, password)
#         """
#         return (self.cucmaxluser, self.cucmpassword)            
                                        
#     def setPublisherIP(self, pubip):
#         self.pubip = pubip
        
#     def getPublisherIP(self):
#         return self.pubip

# class AXL(object):
#     """Abstract class for an AXL request/response object"""
#     def __init__(self, cluster, axlelement):
#         """
#         axlelement: The AXL function that we're calling - ex listPhones
#         cluster: A cluster object
        
#         """
#         self.cluster = cluster
#         self.axlelement = axlelement
#         self.soapheaders = {'Content-type':'text/xml', 'SOAPAction':'CUCM:DB ver=11.5 ' + axlelement}
        
#     def runAXLRequest(self, printrequest = False, printresponse = False):    
#         self.AXLRequest = requests.post('https://'+ self.cluster.getPublisherIP() +':8443/axl/', data = self.soaprequest, headers = self.soapheaders, verify = False, auth=(self.cluster.getAXLInfo()[0], self.cluster.getAXLInfo()[1]))
        
#         self.root = ET.fromstring(self.AXLRequest.text)
        
#         if printrequest:
#             self.printAXLRequest()
            
#         if printresponse:
#             self.printAXLResponse()

#         return self.root
    
#     def printAXLRequest(self):
#         print 'REQUEST'
#         reparsed = xml.dom.minidom.parseString(self.soaprequest)
#         print reparsed.toprettyxml(indent='\t')
                
#     def printAXLResponse(self):    
#         print 'RESPONSE'
#         rootstring = ET.tostring(self.root, 'utf-8')
#         reparsed = xml.dom.minidom.parseString(rootstring)
#         print reparsed.toprettyxml(indent='\t')

# class AXLExecuteRequest(AXL):
#     def __init__(self, cluster, axlelement, query):
#         AXL.__init__(self, cluster, axlelement)   
#         self.query = query 
#         self.soaprequest = '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ns="http://www.cisco.com/AXL/API/'+ self.cluster.getVersion() +'"><soapenv:Header /><soapenv:Body><ns:'+ self.axlelement +'><sql>' + self.query + '</sql></ns:'+ self.axlelement +'></soapenv:Body></soapenv:Envelope>'

# def querybuilder(table, columns, testval):
#     """
#     Creates the SQL query
#     table (string): the CUCM table name for SQL FROM
#     columns (list): a list of columns in the table
#     testval (string): the value that is being searched for
    
#     Return (string): the SQL query
#     """  

#     #orstate is a flag to ensure that "OR" is added in after the first column clause
#     orstate = ''
   
#     for column in columns:
#         if orstate == '':
#             orstate = column + ' = ' + '"' + testval + '"'
#         else:
#             orstate += ' OR ' + column + ' = ' + '"' + testval + '"'
                
#     return 'SELECT * FROM ' + table + ' WHERE ' + orstate

# def findFault(table, coltypes, testval):
#     """
#     Some AXL query's will fail due to a issue in type - this seeks to resolve those issues
#     table (string): the CUCM table name for SQL FROM
#     coltypes (list of tuples of strings): a list of tuples of (column, type)
#     testval (string): the value that is being searched for
    
#     Return (list): new columns whose types won't error
#     """  
#     newcolumn = []
#     typelist = []
#     badlist = []

#     #Take each item in coltypes and create a non-duplicative list of types - AXL test each type to see which fail and append to badlist
#     for value in coltypes:
#         if value[1] not in typelist:
#             typelist.append(value[1])
#             testquery = AXLExecuteRequest(cluster, 'executeSQLQuery', 'SELECT * FROM ' + table + ' WHERE ' + value[0] + ' = ' + '"' + testval + '"')
#             testroot = testquery.runAXLRequest()
#             if 'Fault' in testroot[0][0].tag:                            
#                 badlist.append(value[1])
    
#     #Take the columns that aren't in badlist and append to newcolumn list
#     for value in coltypes:
#         if value[1] not in badlist:
#             newcolumn.append(value[0])      
        
#     return newcolumn 
                                                           
# def finddbentry(testval, cluster):
#     """
#     First creates 
#     """

#     #Find each column in each table - row with tabname, colname as tags
#     dbcreatequery = 'SELECT tabname, syscolumns.tabid, colname, coltype FROM syscolumns LEFT JOIN systables ON syscolumns.tabid = systables.tabid'    
#     request = AXLExecuteRequest(cluster, 'executeSQLQuery', dbcreatequery)    
    
#     root = request.runAXLRequest()

#     dbdict = {}
#     founddict = {}
#     tabid = {}
#     log = {}

#     # Collect all rows and create a dict with table as key and columns as list of values
#     for item in root.iter('row'):
     
#         tabname = item.find('tabname').text
#         tabid = item.find('tabid').text
#         colname = item.find('colname').text
#         coltype = item.find('coltype').text
#         tabkey = (tabname, tabid)

#         # Remove the IF
#         if tabname == 'device':
#             if tabkey not in dbdict:
#                 dbdict[tabkey] = [(colname, coltype)]
#             else:
#                 dbdict[tabkey].append((colname, coltype))         

#     #Create the WHERE clause based on building an "OR" for each column to test value presence
#     for tabkey in dbdict:
#         # print 'Checking', tabkey[0]
#         table = tabkey[0]
#         columns = []
#         #pull the column names out of each dbdict entry
#         for value in dbdict[tabkey]:
#             columns.append(value[0])

#         query = querybuilder(table, columns, testval)        
#         filterquery = AXLExecuteRequest(cluster, 'executeSQLQuery', query)            
#         root = filterquery.runAXLRequest()    
            
#         #if there's a problem with the AXL responses for that table try and find the offending column    
#         if 'Fault' in root[0][0].tag:
#             for item in root.iter('axlError'):
#                 for error in item:
#                     axlcode = item.find('axlcode').text
#                     axlmessage = item.find('axlmessage').text
#                     request = item.find('request').text
#             newcolumns = findFault(table, dbdict[tabkey], testval)           
            
#             #rerun the AXL request with a query containing only the columns that yield good data
#             query = querybuilder(table, newcolumns, testval)   
#             filterquery = AXLExecuteRequest(cluster, 'executeSQLQuery', query)            
#             root = filterquery.runAXLRequest()               
                
#             log[table] = (axlcode, axlmessage)         
        
#         #root should now have info despite any type errors we can move on
#         count = 0
        
#         for item in root.iter('row'):
#             count += 1     
#             if table not in founddict:
#                 founddict[table] = [(count,)]
#             else:
#                 founddict[table].append((count,))        
            
#             for i in item:
#                 founddict[table][count - 1] += ((i.tag, i.text),)

#     return founddict    

# if __name__ == '__main__':   
    
    
#     if len(sys.argv) == 3:
#         cluster = Cluster()
#         testval = sys.argv[2]
#         print 'I got to python with' + sys.argv[2]
#         sys.stdout.flush()
#         testfound = json.dumps(finddbentry(testval, cluster))

#     elif len(sys.argv) == 5:
#         cluster = Cluster(sys.argv[1], sys.argv[2], sys.argv[3], sys.argv[4])
#         testval = sys.argv[5]
#         testfound = json.dumps(finddbentry(testval, cluster))
        
#     else:
#         testfound = "Error: Number of arguments is incorrect"
 
#     db.results.update_one({'_id' : ObjectId(sys.argv[1])}, {'$set' : {'blob' : testfound}}, upsert=False)


#     # getme = db.results.find_one({'_id' : ObjectId('5c42020cb11aa54f851e9e68')})
#     # print(getme)

#     # pprint(db.results.find_one())

    
#     # print(str(test.modified_count))

#     # pprint(test)

#     # for key in testfound:
#     #     print testfound[key]    

      
