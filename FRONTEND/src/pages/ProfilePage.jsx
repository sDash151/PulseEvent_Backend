import { useAuth } from '../hooks/useAuth'
import BackButton from '../components/ui/BackButton'
import Lottie from 'lottie-react';
import avatarAnimation from '../assets/BOY2.json';

const ProfilePage = () => {
  const { currentUser } = useAuth()
  // Profile is now read-only, no state management needed for editing

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] px-4 pt-24 pb-16">
      <div className="max-w-4xl mx-auto relative z-10 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl shadow-[0_0_25px_rgba(255,255,255,0.08)] p-8">
        {/* Ambient Glows */}
        <div className="absolute top-0 left-[25%] w-80 h-80 bg-amber-400/20 rounded-full blur-[150px] z-0"></div>
        <div className="absolute bottom-0 right-[20%] w-72 h-72 bg-blue-400/10 rounded-full blur-[120px] z-0"></div>
        <div className="relative z-10 space-y-8">
          <div className="flex items-center justify-between">
            <BackButton to="/dashboard" variant="subtle" label="Dashboard" />
            <h2 className="text-3xl font-bold text-white">Your Profile</h2>
            <div className="w-20"></div> {/* Spacer for centering */}
          </div>
          
          {/* Read-only Notice */}
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center">
                <span className="text-blue-400 text-lg">ℹ️</span>
              </div>
              <div>
                <h3 className="text-blue-300 font-semibold text-sm">Profile Information</h3>
                <p className="text-blue-200 text-xs">This is a read-only view of your profile. Contact support if you need to update any information.</p>
              </div>
            </div>
          </div>
          {/* Avatar */}
          <div className="flex justify-center">
            <div className="relative w-24 h-24">
              {currentUser && currentUser.avatar ? (
                <img
                  src={currentUser.avatar}
                  alt="User Avatar"
                  className="w-24 h-24 rounded-full border-4 border-amber-400 object-cover"
                />
              ) : (
                <Lottie animationData={avatarAnimation} loop={true} style={{ width: '100%', height: '100%' }} />
              )}
            </div>
          </div>
          {/* Profile Info (read-only) */}
          <div className="space-y-6">
            {/* Basic Information */}
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <h3 className="text-lg font-semibold text-amber-300 mb-4 flex items-center gap-2">
                <span className="text-xl">👤</span>
                Basic Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Name</label>
                  <div className="w-full px-4 py-2.5 bg-white/10 text-white border border-white/20 rounded-lg">{currentUser?.name || '-'}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
                  <div className="w-full px-4 py-2.5 bg-white/10 text-white border border-white/20 rounded-lg opacity-70">{currentUser?.email || '-'}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Role</label>
                  <div className="w-full px-4 py-2.5 bg-white/10 text-white border border-white/20 rounded-lg capitalize">{currentUser?.role || '-'}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Gender</label>
                  <div className="w-full px-4 py-2.5 bg-white/10 text-white border border-white/20 rounded-lg capitalize">
                    {currentUser?.gender ? 
                      currentUser.gender === 'prefer_not_to_say' ? 'Prefer not to say' : 
                      currentUser.gender : 
                      '-'
                    }
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Phone Number</label>
                  <div className="w-full px-4 py-2.5 bg-white/10 text-white border border-white/20 rounded-lg">{currentUser?.phoneNumber || '-'}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Graduation Year</label>
                  <div className="w-full px-4 py-2.5 bg-white/10 text-white border border-white/20 rounded-lg">{currentUser?.graduationYear || '-'}</div>
                </div>
              </div>
            </div>

            {/* Academic Information */}
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <h3 className="text-lg font-semibold text-amber-300 mb-4 flex items-center gap-2">
                <span className="text-xl">🎓</span>
                Academic Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">College</label>
                  <div className="w-full px-4 py-2.5 bg-white/10 text-white border border-white/20 rounded-lg">{currentUser?.collegeName || '-'}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">State</label>
                  <div className="w-full px-4 py-2.5 bg-white/10 text-white border border-white/20 rounded-lg">{currentUser?.collegeState || '-'}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">District</label>
                  <div className="w-full px-4 py-2.5 bg-white/10 text-white border border-white/20 rounded-lg">{currentUser?.collegeDistrict || '-'}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Department</label>
                  <div className="w-full px-4 py-2.5 bg-white/10 text-white border border-white/20 rounded-lg">{currentUser?.collegeDepartment || '-'}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Degree Program</label>
                  <div className="w-full px-4 py-2.5 bg-white/10 text-white border border-white/20 rounded-lg">{currentUser?.degreeName || '-'}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Specialization</label>
                  <div className="w-full px-4 py-2.5 bg-white/10 text-white border border-white/20 rounded-lg">{currentUser?.specializationName || '-'}</div>
                </div>
              </div>
            </div>

            {/* Account Information */}
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <h3 className="text-lg font-semibold text-amber-300 mb-4 flex items-center gap-2">
                <span className="text-xl">🔐</span>
                Account Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Member Since</label>
                  <div className="w-full px-4 py-2.5 bg-white/10 text-white border border-white/20 rounded-lg">
                    {currentUser?.createdAt ? new Date(currentUser.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    }) : '-'}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Account Status</label>
                  <div className="w-full px-4 py-2.5 bg-green-500/20 text-green-300 border border-green-500/30 rounded-lg font-medium">
                    Active
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfilePage
