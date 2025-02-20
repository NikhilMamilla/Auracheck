import React, { useState, useEffect } from 'react';
import { FiCamera } from 'react-icons/fi';
import { FaUserCircle } from 'react-icons/fa';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase'; // Adjust the import path as necessary
import { useAuth } from '../context/AuthContext'; // Adjust the import path as necessary

function Profile() {
  const { currentUser } = useAuth();
  const [profileImage, setProfileImage] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [language, setLanguage] = useState("");
  const [notifications, setNotifications] = useState("");
  const [theme, setTheme] = useState("");

  useEffect(() => {
    const fetchUserData = async () => {
      if (currentUser) {
        const userDocRef = doc(db, 'users', currentUser.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const data = userDoc.data();
          setName(data.name || "");
          setEmail(data.email || "");
          setPhone(data.phone || "");
          setLocation(data.location || "");
          setLanguage(data.language || "");
          setNotifications(data.notifications || "");
          setTheme(data.theme || "");
          setProfileImage(data.profileImage || null);
        }
      }
    };

    fetchUserData();
  }, [currentUser]);

  const handleProfilePictureChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEditToggle = () => {
    setIsEditing(true);
    setName("");
    setEmail("");
    setPhone("");
    setLocation("");
    setLanguage("");
    setNotifications("");
    setTheme("");
  };

  const handleSave = async () => {
    setIsEditing(false);
    const userDocRef = doc(db, 'users', currentUser.uid);
    await updateDoc(userDocRef, {
      name,
      email,
      phone,
      location,
      language,
      notifications,
      theme,
      profileImage,
    });
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Auracheck</h1>
      <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow p-6">
        <div className="relative w-32 h-32 mx-auto mb-6">
          {profileImage ? (
            <img
              src={profileImage}
              alt="Profile"
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            <FaUserCircle className="w-full h-full text-gray-400" />
          )}
          <label className="absolute bottom-0 right-0 bg-blue-500 p-2 rounded-full cursor-pointer hover:bg-blue-600 transition-colors">
            <FiCamera className="w-5 h-5 text-white" />
            <input
              type="file"
              className="hidden"
              accept="image/*"
              onChange={handleProfilePictureChange}
            />
          </label>
        </div>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold mb-2">Personal Information</h3>
            <div className="space-y-2">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-2 border rounded"
                placeholder="Name"
              />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-2 border rounded"
                placeholder="Email"
              />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full p-2 border rounded"
                placeholder="Phone"
              />
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full p-2 border rounded"
                placeholder="Location"
              />
            </div>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Preferences</h3>
            <div className="space-y-2">
              <input
                type="text"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full p-2 border rounded"
                placeholder="Language"
              />
              <input
                type="text"
                value={notifications}
                onChange={(e) => setNotifications(e.target.value)}
                className="w-full p-2 border rounded"
                placeholder="Notifications"
              />
              <input
                type="text"
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                className="w-full p-2 border rounded"
                placeholder="Theme"
              />
            </div>
          </div>
        </div>
        <div className="mt-6">
          {isEditing ? (
            <button
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors"
              onClick={handleSave}
            >
              Save
            </button>
          ) : (
            <button
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
              onClick={handleEditToggle}
            >
              Edit Profile
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default Profile;