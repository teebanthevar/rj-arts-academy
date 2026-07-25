import { useState } from "react";
import { uploadProfileImage } from "../lib/profileImage";
import { updateProfileImage } from "../lib/student";

import "./ProfileAvatar.css";

function ProfileAvatar({ profile, refresh }) {
  const [loading, setLoading] = useState(false);

  async function handleImage(e) {
    const file = e.target.files[0];

    if (!file) return;

    try {
      setLoading(true);

      const imageUrl = await uploadProfileImage(file);

      await updateProfileImage(imageUrl);

      await refresh();

    } catch (err) {
      console.error(err);
      alert(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="profile-avatar-card">

      <label className="avatar-label">

        <img
          src={
            profile.profile_image ||
            "https://placehold.co/220x220?text=RJ"
          }
          alt="Profile"
          className="profile-avatar"
        />

        <input
          type="file"
          accept="image/*"
          hidden
          onChange={handleImage}
        />

      </label>

      <h2>{profile.full_name}</h2>

      <p>{profile.email}</p>

      <button>
        {loading ? "Uploading..." : "Change Photo"}
      </button>

    </div>
  );
}

export default ProfileAvatar;