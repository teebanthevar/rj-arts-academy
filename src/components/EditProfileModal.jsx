import { useEffect, useState } from "react";
import "./EditProfileModal.css";

function EditProfileModal({
  open,
  onClose,
  student,
  onSave,
}) {
  const [form, setForm] =useState({
    full_name:"",
    email:"",
    phone:"",
    dob:"",
    address:"",
    parent_name:"",
    emergency_contact:"",
  });

  useEffect(()=>{

    if(student){

      setForm({

        full_name:student.full_name || "",

        email:student.email || "",

        phone:student.phone || "",

        dob:student.dob || "",

        address:student.address || "",

        parent_name:student.parent_name || "",

        emergency_contact:
        student.emergency_contact || "",

      });

    }

  },[student]);

  function handleChange(e){

    setForm({

      ...form,

      [e.target.name]:e.target.value,

    });

  }

  function handleSubmit(e){

    e.preventDefault();

    onSave(form);

  }

  if(!open) return null;

  return(

<div className="modal-overlay">

<div className="profile-modal">

<div className="modal-header">

<h2>Edit Profile</h2>

<button onClick={onClose}>✕</button>

</div>

<form onSubmit={handleSubmit}>

<div className="form-grid">

<div>

<label>Full Name</label>

<input
name="full_name"
value={form.full_name}
onChange={handleChange}
/>

</div>

<div>

<label>Email</label>

<input
name="email"
value={form.email}
onChange={handleChange}
/>

</div>

<div>

<label>Phone</label>

<input
name="phone"
value={form.phone}
onChange={handleChange}
/>

</div>

<div>

<label>Date of Birth</label>

<input
type="date"
name="dob"
value={form.dob}
onChange={handleChange}
/>

</div>

<div className="full">

<label>Address</label>

<textarea
rows="3"
name="address"
value={form.address}
onChange={handleChange}
/>

</div>

<div>

<label>Parent / Guardian</label>

<input
name="parent_name"
value={form.parent_name}
onChange={handleChange}
/>

</div>

<div>

<label>Emergency Contact</label>

<input
name="emergency_contact"
value={form.emergency_contact}
onChange={handleChange}
/>

</div>

</div>

<div className="modal-footer">

<button
type="button"
className="cancel-btn"
onClick={onClose}
>

Cancel

</button>

<button
className="save-btn"
type="submit"
>

Save Changes

</button>

</div>

</form>

</div>

</div>

  );

}

export default EditProfileModal;