import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import LinearProgress from '@material-ui/core/LinearProgress';

const styles = {
  root: {
    flexGrow: 1,
  },
};

class StatusBar extends React.Component {
  state = {
    prog: 0,
  };

  componentDidMount() {
    this.timer = setInterval(this.progress, 1000);
 
  }

  componentWillUnmount() {
    clearInterval(this.timer);
  }

  progress = () => {
    let prog = this.props.completed/this.props.tableCount * 100

    if (prog === 100) {
      this.setState({ prog: 0 });
    } else {
      this.setState({ prog: prog });
    }
  };

  render() {
    const { classes } = this.props;
    return (
      <div className={classes.root}>
        <LinearProgress variant="determinate" value={this.state.prog} />
      </div>
    );
  }
}

StatusBar.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(StatusBar);
