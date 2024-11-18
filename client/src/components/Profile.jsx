import  { useEffect } from 'react'

function Profile() {
    useEffect(() => {
        console.log("Profile is renderd");
      }, []);
      return (
        <div className='custom-container'>Profile</div>
      );
}

export default Profile