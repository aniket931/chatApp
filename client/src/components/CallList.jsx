import { useEffect } from "react";

function CallList() {
  useEffect(() => {
    console.log("CallList is renderd");
  }, []);
  return (
    <div className='custom-container'>CallList</div>
  )
}

export default CallList