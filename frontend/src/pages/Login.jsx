import React from 'react'

export default function Login() {
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="w-full max-w-md p-8 bg-white rounded shadow">
        <h1 className="text-2xl font-bold mb-4">Sign in</h1>
        <form>
          <label className="block mb-2">Email</label>
          <input className="w-full mb-4 p-2 border rounded" />
          <label className="block mb-2">Password</label>
          <input type="password" className="w-full mb-4 p-2 border rounded" />
          <button className="w-full py-2 bg-blue-600 text-white rounded">Sign in</button>
        </form>
      </div>
    </div>
  )
}
