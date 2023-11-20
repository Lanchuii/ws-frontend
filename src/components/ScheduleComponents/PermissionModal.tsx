import { useState } from "react"
import { RxCross2 } from "react-icons/rx";

interface Props {
  permissionModal: boolean
  setPermissionModal: React.Dispatch<React.SetStateAction<boolean>>
  setPermission: React.Dispatch<React.SetStateAction<boolean>>
}

const PermissionModal = ({permissionModal, setPermissionModal, setPermission}: Props) => {
  const [permissionPass, setPermissionPass] = useState<string>('')

  const handlePermission = (event: React.FormEvent<HTMLFormElement>, permissionPass: string) => {
    event.preventDefault();

    if (permissionPass === 'lampstand123') {
      setPermission(true)
    }
    else {
      alert('Invalid password')
    }

    setPermissionModal(false)
  }

  return (
    <div className="fixed inset-0 z-50 overflow-auto bg-gray-800 bg-opacity-50 flex items-center justify-center">
      <div className="bg-gray-900 p-6 rounded-lg shadow-md w-100">
      <div className="flex justify-between">
          <h2 className="text-white font-semibold">Enter password: </h2>
          <button 
            className="bg-red-600 text-white px-1 rounded hover:bg-red-700"
            onClick={()=>setPermissionModal(!permissionModal)}
          >
           <RxCross2 />
          </button>
        </div> 
        <form onSubmit={(e)=>handlePermission(e, permissionPass)}>
          <input 
            type="password"
            value={permissionPass}
            onChange={(event) => {
              if (event.target) {
                setPermissionPass(event.target.value);
              }
            }}
            className="border-2 shadow-inner"
          />
          <button type="submit" className="bg-yellow-400 text-gray-900 font-bold rounded py-1 px-2 lg:ml-2 sm:mt-2">Submit</button>
        </form>
      </div>
    </div>
  )
}

export default PermissionModal