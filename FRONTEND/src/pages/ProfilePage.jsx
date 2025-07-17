import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import Button from '../components/ui/Button'

const ProfilePage = () => {
  const { currentUser } = useAuth()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (currentUser) {
      setName(currentUser.name)
      setEmail(currentUser.email)
    }
  }, [currentUser])

  const [message, setMessage] = useState("");
  const [avatar, setAvatar] = useState(null);

  const handleAvatarChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setAvatar(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      // Update profile API call
      const formData = new FormData();
      formData.append("name", name);
      if (avatar) formData.append("avatar", avatar);
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        body: formData,
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to update profile");
      setMessage("Profile updated!");
    } catch (err) {
      setMessage(err.message || "Error updating profile");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] px-4 pt-24 pb-16">
      <div className="max-w-md mx-auto relative z-10 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl shadow-[0_0_25px_rgba(255,255,255,0.08)] p-8">
        {/* Ambient Glows */}
        <div className="absolute top-0 left-[25%] w-80 h-80 bg-amber-400/20 rounded-full blur-[150px] z-0"></div>
        <div className="absolute bottom-0 right-[20%] w-72 h-72 bg-blue-400/10 rounded-full blur-[120px] z-0"></div>
        <div className="relative z-10 space-y-8">
          <h2 className="text-3xl font-bold text-white text-center">Your Profile</h2>
          {/* Avatar */}
          <div className="flex justify-center">
            <div className="relative group">
              <img
                src={avatar ? URL.createObjectURL(avatar) : "/avatar.png"}
                alt="User Avatar"
                className="w-24 h-24 rounded-full border-4 border-amber-400 object-cover"
              />
              <label className="absolute bottom-0 right-0 bg-amber-500 text-white rounded-full p-1 text-xs cursor-pointer opacity-0 group-hover:opacity-100 transition">
                ✏️
                <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
              </label>
            </div>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">Name</label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 bg-white/10 text-white border border-white/20 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">Email</label>
              <input
                type="email"
                id="email"
                value={email}
                disabled
                className="w-full px-4 py-2.5 bg-white/10 text-white border border-white/20 rounded-lg placeholder-gray-400 opacity-70 cursor-not-allowed"
              />
            </div>
            {message && (
              <div className="text-center text-sm text-amber-400 font-medium">{message}</div>
            )}
            <Button type="submit" className="w-full justify-center" disabled={loading}>
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default ProfilePage
