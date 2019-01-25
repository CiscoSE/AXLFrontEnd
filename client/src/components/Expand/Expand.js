import React from "react";
import Collapse from '@material-ui/core/Collapse';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListSubheader from '@material-ui/core/ListSubheader';
import ExpandLess from '@material-ui/icons/RemoveCircle';
import ExpandMore from '@material-ui/icons/AddCircle';
import InboxIcon from '@material-ui/icons/MoveToInbox';



class Expand extends React.Component {

    state = {
    expand: false
    };

    handleClick = () => {
        this.setState(state => ({ expand: !state.expand }));
    }

  render() {
    return (
        <div>
            <List component="nav">
                <ListItem button onClick={this.handleClick}>
                    <ListItemIcon>
                        {this.state.expand ? <ExpandLess /> : <ExpandMore />}
                    </ListItemIcon>
                    <ListItemText inset primary={"Record " + this.props.record} />
                        {/* {this.state.open ? <ExpandLess /> : <ExpandMore />} */}
                </ListItem>
                                        
                <Collapse in={this.state.expand} timeout="auto" unmountOnExit>
                    <List component="div">
                        <ListItem>
                            {Object.keys(this.props.result[this.props.table][this.props.record]).map((data, index) => (
                                <div key={index}>
                                    <ListItemText inset primary={data + ":" + this.props.result[this.props.table][this.props.record][data]} />
                                </div>
                            )
                            )
                            }
                        </ListItem>
                    </List>
                </Collapse>

            </List>
        </div>
    )
  }
}

export default Expand;





