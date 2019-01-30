import React from 'react';
import API from "../../utils/API";
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { withStyles } from '@material-ui/core/styles';
import Drawer from '@material-ui/core/Drawer';
import CssBaseline from '@material-ui/core/CssBaseline';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import List from '@material-ui/core/List';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import Input from '@material-ui/icons/Input';
import InputText from '../InputText'
import DataCard from '../DataCard'
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import StatusBar from '../StatusBar';

const drawerWidth = 240;

const styles = theme => ({
  root: {
    display: 'flex',
  },
  appBar: {
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  },
  appBarShift: {
    width: `calc(100% - ${drawerWidth}px)`,
    marginLeft: drawerWidth,
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  menuButton: {
    marginLeft: 12,
    marginRight: 20,
  },
  hide: {
    display: 'none',
  },
  drawer: {
    width: drawerWidth,
    flexShrink: 0,
  },
  drawerPaper: {
    width: drawerWidth,
  },
  drawerHeader: {
    display: 'flex',
    alignItems: 'center',
    padding: '0 8px',
    ...theme.mixins.toolbar,
    justifyContent: 'flex-end',
  },
  content: {
    flexGrow: 1,
    padding: theme.spacing.unit * 3,
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    marginLeft: -drawerWidth,
  },
  contentShift: {
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
    marginLeft: 0,
  },
  button: {
    marginTop: '50px',
  },

  paper: {
    marginBottom: '25px',
  }
});

class OuterFrame extends React.Component {

    state = {
      open: true,
      foundResult: false,
      searching: false,
      tableNames: [],
      result: {},
      notFound: true
      // result: {  
      //   'vs_view': {'1': {'uvs':'pickle', 'vvs': '23423423426457456'}, '2': {'bvs':'23423423424323434234', 'fvs': '23423423426457456'}},
      //   'device': {'1': {'rvs':'23423423424323434234', 'wvs': '23423423426457456'}, '2': {'ovs':'23423423424o23434234', 'qvs': '23423423426457456'}}  
      // }
    };
    
      handleDrawerOpen = () => {
        this.setState({ open: true });
      };

      handleDrawerClose = () => {
        this.setState({ open: false });
      };
    
      handleInput = name => inputValue => {
        this.setState({[name]: inputValue});

      }

      handleSearch = event => {
        event.preventDefault();
        //set the search string in the database
      
        let searchString = this.state.Search_Text
        let clusterIp = this.state.CUCM_IP_Address
        let clusterVersion = this.state.CUCM_Version
        let axlUser = this.state.AXL_Username
        let axlPassword =this.state.AXL_Password

        API.setSearchString({
            searchString: searchString
        })
            .then(res => {
                //kick off the python script on the server

                let searchId = res.data._id
                this.setState({foundResult: false})
                
                API.startSearch({
                    searchId: searchId,
                    searchString: searchString,
                    clusterIp: clusterIp,
                    clusterVersion: clusterVersion,
                    axlUser: axlUser,
                    axlPassword: axlPassword
                })
                    .then(res => {
                    //continue to check for the python script having completed and display data
                        let timer = setInterval(() => {
                            API.checkResult({
                                searchId: searchId
                                // searchId: '5c423894611cd9b64a955c00'
                            })
                                .then(res => {
                                    if (res.data.tables) {
                                      this.setState({tableCount : res.data.tables})
                                      this.setState({searching: true})
                                      this.setState({completed : res.data.completed})
                                    }
                                    if (res.data.result) {

                                        let result = JSON.parse(res.data.result)
                                        clearInterval(timer);
                                        this.setState({result : JSON.parse(res.data.result)})
                                        this.setState({foundResult: true})
                                        this.setState({searching: false})
                                        this.setState({notFound: false})
                                        
                                        if (Object.keys(result).length === 0) {
                                          this.setState({notFound: true})
                                        }
      
                                        //clean the database - these searches are not persistant
                                        API.removeDbEntry({
                                          searchId: searchId
                                        })
                                          .then(res => {
                                            
                                          })
                                    }
                                })
                        }, 5000) 
                      })
              })
        };

      render() {
        const { classes, theme } = this.props;
        const { open } = this.state;
    
        return (
          <div className={classes.root}>
            <CssBaseline />
            <AppBar
              position="fixed"
              className={classNames(classes.appBar, {
                [classes.appBarShift]: open
              })}
            >
              <Toolbar disableGutters={!open}>
                <IconButton
                  color="inherit"
                  aria-label="Open drawer"
                  onClick={this.handleDrawerOpen}
                  className={classNames(classes.menuButton, open && classes.hide)}
                >
                  <MenuIcon />
                </IconButton>
                <Typography variant="h6" color="inherit" noWrap>
                  CUCM Database Search
                </Typography>
              </Toolbar>
            </AppBar>
            <Drawer
              className={classes.drawer}
              variant="persistent"
              anchor="left"
              open={open}
              classes={{
                paper: classes.drawerPaper
              }}
            >
              <div className={classes.drawerHeader}>
                <IconButton onClick={this.handleDrawerClose}>
                  {theme.direction === "ltr" ? (
                    <ChevronLeftIcon />
                  ) : (
                    <ChevronRightIcon />
                  )}
                </IconButton>
              </div>
              <List>
                {["Search_Text", "CUCM_IP_Address", "CUCM_Version", "AXL_Username", "AXL_Password"].map((fieldName, index) => (
                  <ListItem key = {index}>
                    <ListItemIcon>
                      <Input/>
                    </ListItemIcon>
                    <InputText onInputText={this.handleInput(fieldName)} fieldName = {fieldName}>
                    </InputText>
                  </ListItem>
                ))}
                <Divider />
                <Button 
                  variant="contained" 
                  className={classes.button}
                  onClick={this.handleSearch}
                >
                  Search
                </Button>
              </List>  
            </Drawer>
            <main
              className={classNames(classes.content, {
                [classes.contentShift]: open
              })}
            >
              <div className={classes.drawerHeader} />
              {this.state.foundResult ? (
                <div>
                  {this.state.notFound ? (
                    <Grid container spacing={24}>
                      <Grid item xs={12}>
                        <Typography variant='h6' gutterBottom color='primary'>
                          The search term did not match any items in the database.
                        </Typography>
                      </Grid>
                    </Grid>
                  ) : (
                    <Grid container spacing={24}>
                        {Object.keys(this.state.result).sort().map((table, index) => (
                            <Grid key={index} item xs={12}>
                              <Typography variant='h6' gutterBottom color='primary'>
                                {table}
                              </Typography>
                              <Divider/>
                              <Grid container spacing={24}> 
                                {Object.keys(this.state.result[table]).sort().map((record, index) => (
                                  <Grid key={index} item xs={4}>  
                                    <DataCard key={index} searchString={this.state.Search_Text} result= {this.state.result} table={table} record = {record}>
                          
                                    </DataCard>
                                  </Grid> 
                                )
                                )                     
                                }
                              </Grid>
                            </Grid>
                        )
                        )
                        }
                      
                    </Grid>       
                  )}
                </div>
                      
                  ) : (
                      <div>
                        {this.state.searching ? (
                          <Grid container spacing={24}>
                          <Grid item xs={3}/>
                          <Grid item xs={6}>
                            <Typography variant='h6' gutterBottom color='primary'>
                              Progress
                            </Typography>
                            <StatusBar tableCount={this.state.tableCount} completed={this.state.completed}></StatusBar>
                          </Grid>
                          <Grid item xs={3}/>
                          </Grid>
                          ) : (
                            <div>
                              <Paper>
                                <Typography variant='h6' gutterBottom color='primary'>
                                  To search CUCM's database please input the requested information on the left and press 'Search.'
                                </Typography>
                                
                                <Typography variant='h6' gutterBottom color='secondary'>
                                  Be patient - this search can take upwards of 10 minutes to complete.
                                </Typography>
                              </Paper>
                            </div>  
                        
                          )}
                      </div>
                      )
              }    
            </main>
          </div>
        );
      }
    }
    
    OuterFrame.propTypes = {
      classes: PropTypes.object.isRequired,
      theme: PropTypes.object.isRequired
    };

export default withStyles(styles, { withTheme: true })(OuterFrame);
