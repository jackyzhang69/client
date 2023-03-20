import React from 'react';
import PropTypes from 'prop-types';
import 'bootstrap/dist/css/bootstrap.min.css';


class MyInput extends React.Component {
  static propTypes = {
    inputProps: PropTypes.shape({
      width: PropTypes.string,
      id: PropTypes.string,
      label: PropTypes.string,
      invalid_feedback: PropTypes.string,
      onBlur: PropTypes.func
    })
  };


  render() {
    const { id, width, label, invalid_feedback,onBlur} = this.props.inputProps;
    return (
      <div className={`col-md-${width}`}>
        <label htmlFor={id} className="form-label">{label}</label>
        <input type="text" className="form-control" id={id} required onBlur={onBlur}/>
        <div className="invalid-feedback">
          {invalid_feedback}
        </div>
      </div>
    );
  }
}

  
export default MyInput;
