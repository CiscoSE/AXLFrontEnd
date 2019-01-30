import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import DataPill from '../DataPill'
import Divider from '@material-ui/core/Divider';

const styles = {
  card: {
    maxWidth: 345,
  },
  media: {
    height: 140,
  },
};

class DataCard extends React.Component {
    state = {
      name: '',
    };
  

    render() {
    //   const { classes } = this.props;

        return (
        <Card >
            
            <CardContent>
                <Typography gutterBottom variant="caption">
                    pkid: {this.props.result[this.props.table][this.props.record]['pkid']}
                </Typography>
                
            </CardContent>
            <Divider/>
                {Object.keys(this.props.result[this.props.table][this.props.record]).sort().map((fieldName, index) => (
                    <DataPill key={index} searchString={this.props.searchString} result={this.props.result} fieldName={fieldName} value={this.props.result[this.props.table][this.props.record][fieldName]}>
                    </DataPill>
                )
                )
                }
       
        </Card>
    );
    }
  }
  
  
  export default withStyles(styles)(DataCard);

