import React, { Component } from "react";
import API from "../../utils/API";
import Grid from '@material-ui/core/Grid';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import TableIcon from '@material-ui/icons/ListAlt';
import { Col, Row, Container } from "../../components/Grid";
import { Input, TextArea, FormBtn } from "../../components/Form";
import Expand from "../../components/Expand";

const styles = theme => ({
    root: {
      width: '100%',
      maxWidth: 360,
      backgroundColor: theme.palette.background.paper,
    },
    nested: {
      paddingLeft: theme.spacing.unit * 4,
    },
  });

class ResultView extends Component {
    state = {
        searchString: null,
        foundResult: false,
        tableNames: [],
        result: {},
        open: false,
    };

    componentDidMount() {
    }

    handleClick = () => {
        this.setState(state => ({ open: !state.open }));
    }

    handleInputChange = event => {
        const { name, value } = event.target;
        this.setState({
            [name]: value
        });
    };

    handleAddTeacher = event => {
        API.addTeacher({
            schoolName: this.state.teacherSchoolName,
            teacher: {
                fName: this.state.teacherFirstName,
                lName: this.state.teacherLastName,
                email: this.state.teacherEmail,
                password: this.state.teacherPassword,
                phone: this.state.teacherPhone,
                school: this.state.teacherSchoolName
            }
        })
    }

    handleSearch = event => {
        event.preventDefault();
        //set the search string in the database
        console.log("HERE IS THE SEARCH", this.state.searchString);

        let searchString = this.state.searchString

        API.setSearchString({
            searchString: searchString
        })
            .then(res => {
                //kick off the python script on the server

                let searchId = res.data._id

                console.log("Database populated with searchId:", searchId)
                
                API.startSearch({
                    searchId: searchId,
                    searchString: searchString
                })
                    .then(res => {
                    //continue to check for the python script having completed and display data
                        let timer = setInterval(() => {
                            API.checkResult({
                                searchId: searchId
                                // searchId: '5c423894611cd9b64a955c00'
                            })
                                .then(res => {
                                    
                                    if (res.data.blob) {
                                        console.log("Data has been delivered to the database: ", JSON.parse(res.data.blob))
                                        clearInterval(timer);
                                        this.setState({result : JSON.parse(res.data.blob)})
                                        // this.setState({ tableNames: Object.keys(JSON.parse(res.data.blob)) })
                                        this.setState({foundResult: true})
                                    }
                                })
                        }, 15000) 
                    })
            })
    };

    render() {
        const {classes } = this.props;

        return (
            <Container fluid>
                <Grid container spacing={24} justify="space-between">
                    <Grid item xs={7}>
                        <Grid container spacing={8} alignItems="flex-end">
                            <Grid item sm={10}>
                                <Input
                                    fullWidth
                                    value={this.state.searchString}
                                    onChange={this.handleInputChange}
                                    name="searchString"
                                    label="Enter Text To Search For"
                                    placeholder=""
                                />
                            </Grid>
                        </Grid>
                        <Grid item sm={10}>
                            <FormBtn
                                onClick={this.handleSearch}
                                style={{ marginTop: 20, marginBottom: 30 }}>

                                Search
                                </FormBtn>
                        </Grid>
                    </Grid>
                </Grid>
                <Grid>
                    {this.state.foundResult ? (
                        Object.keys(this.state.result).map((table, index) => (
                            <List key={index}>
                                <ListItemIcon>
                                    <TableIcon />
                                </ListItemIcon>
                                <ListItemText inset primary={table} />
                                
                                    {Object.keys(this.state.result[table]).map((record, index) => (
                                        <List key={index}>
                                            <Expand result={this.state.result} table={table} record={record}></Expand>
                                        </List> 
                                        )
                                    )                     
                                    }
                            </List> 
                        )     
                        ) 
                        ) : (
                            <div></div>
                            )
                    }    
                </Grid>
            </Container>
            
        );
    }
}

export default ResultView;
