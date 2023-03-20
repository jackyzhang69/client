import React from 'react';
import MyInput from './components/controls/input';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  const name_validator = (e) => {
    const { id, name } = e.target;
    const false_obj = {
      "id": id,
      "result": false,
      "message": "Name is not valid"
    }
    if (typeof name !== 'string') {
      return false_obj;
    }
    if (name.length < 2) {
      return false_obj;
    }
    if (!/^[a-zA-Z]+$/.test(name)) {
      return false_obj;
    }
    console.log("Name ${name}is valid");
    return {
      "id": id,
      "result": true,
      "message": "Name is valid"
    };
  }



  var objs = [];
  for (let i = 0; i < 9; i++) {
    const obj = {
      label: `Frist Name ${i}`,
      width: '4',
      id: `first_name ${i}`,
      invalid_feedback: "Please enter first name",
      onBlur: name_validator
    }
    objs.push(obj);
  }

  console.log(objs);
  return (
    <div className="App container">
      <div className="row">
        {
          objs.map((inputProps, index) => (
            <MyInput key={index} inputProps={inputProps} />
          ))
        }
      </div>

    </div>
  );

}

export default App;
