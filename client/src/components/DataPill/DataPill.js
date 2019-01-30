import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import Chip from '@material-ui/core/Chip';


const styles = theme => ({
  root: {
    display: 'flex',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  chip: {
    margin: theme.spacing.unit,
  },
});


class DataPill extends React.Component {
    state = {
      showValue: false,
    };

    handleClick = props => event => {
        event.preventDefault();
        this.setState(state => ({ showValue: !state.showValue }))
    };
  
    render() {
    //   const { classes } = this.props;

        return (
    
            <Chip
            label={this.state.showValue ? this.props.fieldName + " : " + this.props.value : this.props.fieldName}
            onClick={this.handleClick(this.props)}
            variant='outlined'
            color={(this.props.value === this.props.searchString) ? 'secondary' : 'primary'}
            />

        )
  }
}

export default withStyles(styles)(DataPill);

