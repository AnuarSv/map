import {Link} from "react-router-dom";

function Home({ user, error }: { user: any; error: any }) {
  return (
    <div className="flex w-full h-screen">
      <div className="w-full flex items-center justify-center lg:w-1/2">

    <div className="bg-white px-10 py-20 rounded-3xl border-2 border-gray-200">
      <h1 className='text-5xl font-semibold'>MAP</h1>
      <p className='font-medium text-lg text-gray-500 mt-4'>Kazakhstan</p>
      {error && <p className='font-medium text-lg text-red-500 mt-4'>{error}</p>}
      {user ? (
        <>
          <p className='font-medium text-lg text-gray-500 mt-4'>Welcome, {user.name}!</p>
          <div className="mt-8">
            <div className="mt-8 flex flex-col gap-y-4">
              <Link to={"/dashboard"} className="p-3 active:scale-[.98] active:duration-75 hover:scale-[1.01] easy-in-out transition-all py-3 rounded-xl bg-blue-500 text-white text-lg font-bold">Enter</Link>
            </div>
          </div>
        </>
      ) : (
        <div>
          <p className='font-medium text-lg text-gray-500 mt-4'>Please log in or sign up to access the map.</p>
          <div className="mt-8">
            <div className="mt-8 flex flex-row w-full gap-y-4">
              <Link
                to={"/login"}
                className="p-3 mr-4 active:scale-[.98] active:duration-75 hover:scale-[1.01] easy-in-out transition-all py-3 rounded-xl bg-blue-500 text-white text-lg font-bold"
              >
                Login
              </Link>
              <Link
                to={"/register"}
                className="p-3 active:scale-[.98] active:duration-75 hover:scale-[1.01] easy-in-out transition-all py-3 rounded-xl bg-gray-500 text-white text-lg font-bold"
              >
                Sign up
              </Link>
            </div>
          </div>
        </div>
      )}
      {/* <div className="mt-8">
        <div className="mt-8 flex flex-col gap-y-4">
          <button className="active:scale-[.98] active:duration-75 hover:scale-[1.01] easy-in-out transition-all py-3 rounded-xl bg-blue-500 text-white text-lg font-bold">Enter</button>
        </div>
      </div> */}
    </div>



    </div>
      <div className="hidden lg:flex h-full w-1/2 items-center justify-center bg-gray-200">
        <div>
          <img src="/mapkz.svg" alt="Kazakhstan Dots Map" />
        </div>
      </div>
    </div>
  )
}
export default Home;