import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';

const styles = theme => ({
  textField: {
    marginLeft: theme.spacing.unit,
    marginRight: theme.spacing.unit,
    width: 150,
  }
});


class InputText extends React.Component {
  state = {
    name: '',
  };

  handleChange = name => event => {
    this.setState({
      [name]: event.target.value,
    });

    this.props.onInputText(event.target.value)
  };

  

  render() {
    const { classes } = this.props;

    return (
        <TextField
          id="standard-name"
          label={this.props.fieldName}
          className={classes.textField}
          value={this.state.name}
          onChange={this.handleChange('name')}
          margin="normal"
        />
     
    );
  }
}


export default withStyles(styles)(InputText);
