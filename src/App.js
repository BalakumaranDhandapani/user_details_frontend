import './App.css';
import "../node_modules/bootstrap/dist/css/bootstrap.min.css"
import { Formik, useFormik } from 'formik';
import { useEffect, useState } from 'react';
import axios from 'axios';

function App() {
  const [isLoading, setLoading] = useState(false);
  const [dataList, setdataList] = useState([]);
  const [isEdit, setEdit] = useState(false);
  const [currentUser, setCurrentUser] = useState([]);

  const myFormik = useFormik({
    initialValues: {
      name: "",
      email: ""
    },
    validate: (values) => {
      let errors = {};
      if (!values.name) {
        errors.name = "Please enter the Stduent name";
      } else if (values.name.length < 3) {
        errors.name = "Name shouldn't be less than 3 letters";
      } else if (values.name.length > 25) {
        errors.name = "Name shouldn't be more than 20 letters";
      }

      if (!values.email) {
        errors.email = "Please enter email";
      } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(values.email)) {
        errors.email = 'Invalid email address';
      }

      return errors;
    },

    onSubmit: async (values) => {
      try {
        setLoading(true);
        if (!isEdit) {
          await axios.post("http://localhost:8000/api/adduser", values);
          getDetails();
        } else {
          await axios.patch(`http://localhost:8000/api/update/${currentUser._id}`, values);
          getDetails();
        }
        setEdit(false);
        //alert('User created successfully');
        setLoading(false);
        myFormik.resetForm();
      } catch (error) {
        console.log(error);
      }
    }

  })

  useEffect(() => {
    getDetails();
  }, [])

  let getDetails = async () => {
    try {
      const datas = await axios.get("https://userdetails-backend.onrender.com/api/getAll");
      setdataList(datas.data);
      setLoading(false);
    } catch (error) {
      console.log(error);
    }
  }

  const handleDelete = async (id) => {
    try {
      const confirmDelete = window.confirm("Are you sure do you want to delete the data?");
      if (confirmDelete) {
        await axios.delete(`http://localhost:8000/api/delete/${id}`)
        getDetails();
      }
    } catch (error) {
      console.log(error);
    }
  }

  let handleEdit = async (id) => {
    try {
      // get particular id data from API
      const userById = await axios.get(`http://localhost:8000/api/getOne/${id}`);
      setCurrentUser(userById.data);
      //set the data in form
      myFormik.setValues({
        name: userById.data.name,
        email: userById.data.email
      })
      setEdit(true);
      //Edit the data
      //when submit update the data in DB through put call in API
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <div className='container'>
      <div className='row'>
        <div className='col-lg-6'>
          <form onSubmit={myFormik.handleSubmit}>
            <div className='row'>
              <div className='col-lg-6'>
                <label>User Name</label>
                <input onChange={myFormik.handleChange} value={myFormik.values.name}
                  name='name' type={"text"} className='form-control'>
                </input>
              </div>
              <div className='col-lg-6'>
                <label>Email</label>
                <input onChange={myFormik.handleChange} value={myFormik.values.email}
                  name='email' type={'email'} className='form-control'>
                </input>
              </div>
              <div className='col-lg-4 mt-3'>
                <input disabled={isLoading} type="submit"
                  value={isEdit ? "Update" : isLoading ? "Creating..." : "Create"}
                  className=' btn btn-primary' />
              </div>
            </div>
          </form>
        </div>
        <div className='col-lg-6'>
          <div className='row'>
            <table className="table table-striped">
              <thead>
                <tr>
                  <th scope="col">#</th>
                  <th scope="col">User Name</th>
                  <th scope="col">Email</th>
                </tr>
              </thead>
              <tbody>
                {
                  dataList.map((user, index) => {
                    return <tr>
                      <th scope="row">{index + 1}</th>
                      <td>{user.name}</td>
                      <td>{user.email}</td>
                      <td> <button onClick={() => handleEdit(user._id)} className='btn btn-warning'>Edit</button></td>
                      <td><button onClick={() => handleDelete(user._id)} className='btn btn-danger'>Delete</button></td>
                    </tr>
                  })
                }
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
