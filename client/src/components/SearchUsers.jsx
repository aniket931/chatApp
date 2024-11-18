import { useEffect } from 'react'

function SearchUsers() {
  useEffect(()=>{
    console.log("Search user is renderd");  
  },[]);
  return (
    <div className='custom-container'>
      Search box
      {
        console.log("Search box clg")
      }
    </div>
  );
}

export default SearchUsers