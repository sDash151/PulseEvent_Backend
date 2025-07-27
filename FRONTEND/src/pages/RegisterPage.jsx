import { useState, useEffect, useCallback } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import Button from '../components/ui/Button'
import ErrorMessage from '../components/ui/ErrorMessage'
import CustomDropdown from '../components/ui/CustomDropdown'
import { registerUser } from '../services/auth'
import { useAuth } from '../hooks/useAuth'
import { useErrorHandler } from '../hooks/useErrorHandler'
import api from '../services/api'
import { getSafeRedirectUrl } from '../utils/redirectValidation'

const RegisterPage = () => {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [pendingInvite, setPendingInvite] = useState(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState('')
  
  // College dropdown states
  const [states, setStates] = useState([])
  const [districts, setDistricts] = useState([])
  const [colleges, setColleges] = useState([])
  const [selectedState, setSelectedState] = useState('')
  const [selectedDistrict, setSelectedDistrict] = useState('')
  const [selectedCollege, setSelectedCollege] = useState('')
  const [selectedCollegeId, setSelectedCollegeId] = useState('')
  const [loadingStates, setLoadingStates] = useState(false)
  const [loadingDistricts, setLoadingDistricts] = useState(false)
  const [loadingColleges, setLoadingColleges] = useState(false)
  
  // Degree and specialization dropdown states
  const [degrees, setDegrees] = useState([])
  const [specializations, setSpecializations] = useState([])
  const [selectedDegree, setSelectedDegree] = useState('')
  const [selectedSpecialization, setSelectedSpecialization] = useState('')
  const [loadingDegrees, setLoadingDegrees] = useState(false)
  const [loadingSpecializations, setLoadingSpecializations] = useState(false)
  
  // "Other" option states
  const [showOtherCollege, setShowOtherCollege] = useState(false)
  const [showOtherDegree, setShowOtherDegree] = useState(false)
  const [showOtherSpecialization, setShowOtherSpecialization] = useState(false)
  const [otherCollege, setOtherCollege] = useState('')
  const [otherDegree, setOtherDegree] = useState('')
  const [otherSpecialization, setOtherSpecialization] = useState('')
  
  // Additional user information states
  const [gender, setGender] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [graduationYear, setGraduationYear] = useState('')
  
  // Use the custom error handler hook - always call with same parameters
  const {
    error,
    errorType,
    errorId,
    clearError,
    setSmartError,
    dismissError,
    handleInputChange
  } = useErrorHandler(10000); // 10 seconds auto-clear
  
  const { login, currentUser } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const params = new URLSearchParams(location.search)
  const redirectPath = params.get('redirect')

  // Fetch states and degrees on component mount
  useEffect(() => {
    fetchStates()
    fetchDegrees()
  }, [])

  // Fetch states from API
  const fetchStates = async () => {
    setLoadingStates(true)
    try {
      const response = await api.get('/api/colleges/states')
      setStates(response.data.states || [])
    } catch (error) {
      console.error('Error fetching states:', error)
      setSmartError('Failed to load states. Please try again.')
    } finally {
      setLoadingStates(false)
    }
  }

  // Fetch districts when state changes
  const fetchDistricts = async (state) => {
    if (!state) {
      setDistricts([])
      setSelectedDistrict('')
      setColleges([])
      setSelectedCollege('')
      return
    }
    
    setLoadingDistricts(true)
    try {
      const response = await api.get(`/api/colleges/districts/${encodeURIComponent(state)}`)
      setDistricts(response.data.districts || [])
      setSelectedDistrict('')
      setColleges([])
      setSelectedCollege('')
    } catch (error) {
      console.error('Error fetching districts:', error)
      setSmartError('Failed to load districts. Please try again.')
    } finally {
      setLoadingDistricts(false)
    }
  }

  // Fetch colleges when district changes
  const fetchColleges = async (state, district) => {
    if (!state || !district) {
      setColleges([])
      setSelectedCollege('')
      setSelectedCollegeId('')
      return
    }
    
    setLoadingColleges(true)
    try {
      const response = await api.get(`/api/colleges/colleges/${encodeURIComponent(state)}/${encodeURIComponent(district)}`)
      setColleges(response.data.colleges || [])
      setSelectedCollege('')
    } catch (error) {
      console.error('Error fetching colleges:', error)
      setSmartError('Failed to load colleges. Please try again.')
    } finally {
      setLoadingColleges(false)
    }
  }

  // Fetch degrees from API
  const fetchDegrees = async () => {
    setLoadingDegrees(true)
    try {
      const response = await api.get('/api/colleges/degrees')
      setDegrees(response.data.degrees || [])
    } catch (error) {
      console.error('Error fetching degrees:', error)
      setSmartError('Failed to load degrees. Please try again.')
    } finally {
      setLoadingDegrees(false)
    }
  }

  // Fetch specializations when degree changes
  const fetchSpecializations = async (degreeId) => {
    if (!degreeId) {
      setSpecializations([])
      setSelectedSpecialization('')
      return
    }
    
    setLoadingSpecializations(true)
    try {
      const response = await api.get(`/api/colleges/specializations/${degreeId}`)
      setSpecializations(response.data.specializations || [])
      setSelectedSpecialization('')
    } catch (error) {
      console.error('Error fetching specializations:', error)
      setSmartError('Failed to load specializations. Please try again.')
    } finally {
      setLoadingSpecializations(false)
    }
  }

  // Handle state selection


  useEffect(() => {
    const inviteInfo = localStorage.getItem('pendingInviteInfo')
    if (inviteInfo) {
      setPendingInvite(JSON.parse(inviteInfo))
      localStorage.removeItem('pendingInviteInfo')
    }
    if (currentUser) {
      navigate('/dashboard')
    }
  }, [currentUser, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setSmartError('Passwords do not match');
      return;
    }
    if (!selectedCollege && !otherCollege) {
      setSmartError('Please select your college or enter a custom one');
      return;
    }
    if (!selectedDegree && !otherDegree) {
      setSmartError('Please select your degree program or enter a custom one');
      return;
    }
    if (!selectedSpecialization && !otherSpecialization) {
      setSmartError('Please select your specialization or enter a custom one');
      return;
    }
    clearError();
    setLoading(true);
    try {
      const { message, token } = await registerUser(
        name, 
        email, 
        password, 
        undefined, 
        selectedCollege || otherCollege, 
        selectedState, 
        selectedDistrict, 
        selectedDegree || otherDegree,
        selectedSpecialization || otherSpecialization,
        gender,
        phoneNumber,
        graduationYear
      );
      console.log('[REGISTER] Backend response:', { message, token });
      if (token) {
        login(token);
        // Secure redirect logic with validation
        const safeRedirectUrl = getSafeRedirectUrl(redirectPath, '/');
        console.log('[REGISTER] Navigating to:', safeRedirectUrl);
        navigate(safeRedirectUrl);
      } else {
        // No token means verification required or already sent
        if (message && message.includes('already been sent')) {
          console.log('[REGISTER] Navigating to /check-email with alreadySent: true');
          navigate('/check-email', { 
            state: { 
              email, 
              alreadySent: true,
              redirectPath // Preserve redirect for email verification
            } 
          });
        } else {
          console.log('[REGISTER] Navigating to /check-email with only email');
          navigate('/check-email', { 
            state: { 
              email,
              redirectPath // Preserve redirect for email verification
            } 
          });
        }
      }
    } catch (err) {
      console.error('[REGISTER] Registration error:', err);
      setSmartError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Password strength regex: min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char
  const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;

  function getPasswordStrength(password) {
    if (!password) return '';
    if (strongPasswordRegex.test(password)) return 'Strong';
    if (password.length >= 8) return 'Medium';
    return 'Weak';
  }

  // Smart input handlers using the error handler hook
  const handleEmailChange = useCallback((e) => {
    const newEmail = e.target.value
    setEmail(newEmail)
    handleInputChange(newEmail, 'email')
  }, [handleInputChange])

  const handleNameChange = useCallback((e) => {
    const newName = e.target.value
    setName(newName)
    handleInputChange(newName, 'name')
  }, [handleInputChange])

  const handlePasswordChange = useCallback((e) => {
    const newPassword = e.target.value
    setPassword(newPassword)
    setPasswordStrength(getPasswordStrength(newPassword))
    handleInputChange(newPassword, 'password')
  }, [handleInputChange])

  const handleConfirmPasswordChange = useCallback((e) => {
    const newConfirmPassword = e.target.value
    setConfirmPassword(newConfirmPassword)
    handleInputChange(newConfirmPassword, 'password')
  }, [handleInputChange])

  return (
    <div className="min-h-screen w-full overflow-y-auto bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] px-4 py-8">
      {/* Enhanced Ambient Glow Spotlights */}
      <div className="absolute top-0 left-[15%] w-[500px] h-[500px] bg-amber-400/15 rounded-full blur-[200px] z-0 animate-pulse-slow"></div>
      <div className="absolute bottom-0 right-[10%] w-[400px] h-[400px] bg-pink-500/10 rounded-full blur-[180px] z-0 animate-pulse-slow animation-delay-1000"></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[250px] z-0 animate-pulse-slow animation-delay-2000"></div>

      {/* Main Container - Much Wider and More Elegant */}
      <div className="max-w-4xl mx-auto relative z-10">
        {/* Registration Card - Professional Design */}
        <div className="relative z-10 w-full bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl shadow-[0_0_40px_rgba(255,255,255,0.1)] p-8 lg:p-12 overflow-visible">
        
          {/* Compact Invitation Banner */}
          {pendingInvite && (
            <div className="mb-4 p-3 bg-amber-400/10 border-l-4 border-amber-500 text-amber-200 rounded-lg shadow animate-fade-in">
              <div className="flex items-start gap-2">
                <span className="text-lg">🎉</span>
                <div>
                  <div className="font-medium text-amber-300 text-sm">
                    You've been invited to <b>{pendingInvite.eventTitle}</b> by <b>{pendingInvite.hostName}</b>!
                  </div>
                  <div className="text-xs text-amber-400 mt-1">
                    After creating your account,{' '}
                    <a href={`/invitation/${pendingInvite.token}`} className="underline font-medium hover:text-amber-300">
                      click here to accept your invitation
                    </a>.
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-amber-400/20 to-pink-400/20 rounded-2xl mb-4">
              <span className="text-2xl">🚀</span>
            </div>
            <h2 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-amber-300 via-pink-300 to-blue-300 bg-clip-text text-transparent mb-3">
              Create Your Account
            </h2>
            <p className="text-gray-300 text-lg max-w-2xl mx-auto">
              Join thousands of event organizers using EventPulse to create amazing experiences
            </p>
          </div>

          {/* Compact Error Message Component */}
          <ErrorMessage
            error={error}
            type={errorType}
            errorId={errorId}
            onDismiss={dismissError}
          />

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className="block text-sm font-semibold text-gray-300 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={handleNameChange}
                  className="w-full px-4 py-3 bg-white/10 text-white border border-white/20 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition-all duration-300 text-base"
                  placeholder="John Doe"
                  required
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-300 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={handleEmailChange}
                  className="w-full px-4 py-3 bg-white/10 text-white border border-white/20 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition-all duration-300 text-base"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            {/* Password Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-gray-300 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    value={password}
                    onChange={handlePasswordChange}
                    className="w-full px-4 py-3 bg-white/10 text-white border border-white/20 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition-all duration-300 text-base pr-12"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-amber-300 hover:text-amber-200 transition-colors duration-200 text-sm font-medium"
                    onClick={() => setShowPassword((prev) => !prev)}
                    tabIndex={-1}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
                {/* Password strength indicator */}
                {password && (
                  <div className={`mt-2 text-sm font-semibold ${passwordStrength === 'Strong' ? 'text-green-400' : passwordStrength === 'Medium' ? 'text-amber-300' : 'text-red-400'}`}>
                    Strength: {passwordStrength}
                  </div>
                )}
                {/* Password requirements */}
                <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-1">
                  <div className={`text-xs ${password.length >= 8 ? 'text-green-400' : 'text-gray-400'}`}>✓ At least 8 characters</div>
                  <div className={`text-xs ${/[A-Z]/.test(password) ? 'text-green-400' : 'text-gray-400'}`}>✓ At least 1 uppercase letter</div>
                  <div className={`text-xs ${/[a-z]/.test(password) ? 'text-green-400' : 'text-gray-400'}`}>✓ At least 1 lowercase letter</div>
                  <div className={`text-xs ${/\d/.test(password) ? 'text-green-400' : 'text-gray-400'}`}>✓ At least 1 number</div>
                  <div className={`text-xs ${/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password) ? 'text-green-400' : 'text-gray-400'}`}>✓ At least 1 special character</div>
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-300 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={handleConfirmPasswordChange}
                    className="w-full px-4 py-3 bg-white/10 text-white border border-white/20 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition-all duration-300 text-base pr-12"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-amber-300 hover:text-amber-200 transition-colors duration-200 text-sm font-medium"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    tabIndex={-1}
                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                  >
                    {showConfirmPassword ? "Hide" : "Show"}
                  </button>
                </div>
                {confirmPassword && confirmPassword !== password && (
                  <div className="mt-2 text-xs text-red-400">Passwords do not match.</div>
                )}
              </div>
            </div>

            {/* Location Section */}
            <div className="bg-white/5 rounded-2xl p-6 border border-white/10 overflow-visible">
              <h3 className="text-lg font-semibold text-amber-300 mb-4 flex items-center gap-2">
                <span className="text-xl">📍</span>
                Location Information
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                              <div>
                <label htmlFor="state" className="block text-sm font-semibold text-gray-300 mb-2">
                  State
                </label>
                <CustomDropdown
                  options={loadingStates ? [] : states.map(state => ({ value: state, label: state }))}
                  value={selectedState}
                  onChange={(value) => {
                    setSelectedState(value);
                    fetchDistricts(value);
                  }}
                  placeholder={loadingStates ? "Loading states..." : "Select a State"}
                  disabled={loadingStates}
                  className="w-full"
                  searchable={true}
                />
              </div>

                              <div>
                <label htmlFor="district" className="block text-sm font-semibold text-gray-300 mb-2">
                  District
                </label>
                <CustomDropdown
                  options={loadingDistricts ? [] : districts.map(district => ({ value: district, label: district }))}
                  value={selectedDistrict}
                  onChange={(value) => {
                    setSelectedDistrict(value);
                    fetchColleges(selectedState, value);
                  }}
                  placeholder={loadingDistricts ? "Loading districts..." : "Select a District"}
                  disabled={loadingDistricts || !selectedState}
                  className="w-full"
                  searchable={true}
                />
              </div>

                              <div>
                <label htmlFor="college" className="block text-sm font-semibold text-gray-300 mb-2">
                  College
                </label>
                <CustomDropdown
                  options={loadingColleges ? [] : [
                    ...colleges.map(college => ({ 
                      value: college.name, 
                      label: `${college.name}${college.city ? ` (${college.city})` : ''}` 
                    })),
                    { value: 'other', label: 'Other (Not listed above)' }
                  ]}
                  value={selectedCollege}
                  onChange={(value) => {
                    setSelectedCollege(value);
                    if (value === 'other') {
                      setShowOtherCollege(true);
                      setOtherCollege('');
                    } else {
                      setShowOtherCollege(false);
                      setOtherCollege('');
                    }
                  }}
                  placeholder={loadingColleges ? "Loading colleges..." : "Select a College"}
                  disabled={loadingColleges || !selectedDistrict}
                  className="w-full"
                  searchable={true}
                />
              </div>
              </div>

              {/* Other College Input */}
              {showOtherCollege && (
                <div className="mt-4 animate-fade-in">
                  <label htmlFor="otherCollege" className="block text-sm font-semibold text-gray-300 mb-2">
                    Enter College Name
                  </label>
                  <input
                    type="text"
                    id="otherCollege"
                    value={otherCollege}
                    onChange={(e) => setOtherCollege(e.target.value)}
                    className="w-full px-4 py-3 bg-white/10 text-white border border-white/20 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition-all duration-300 text-base"
                    placeholder="Enter your college name"
                    required
                  />
                </div>
              )}
            </div>

            {/* Academic Information Section */}
            <div className="bg-white/5 rounded-2xl p-6 border border-white/10 overflow-visible">
              <h3 className="text-lg font-semibold text-amber-300 mb-4 flex items-center gap-2">
                <span className="text-xl">🎓</span>
                Academic Information
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                              <div>
                <label htmlFor="degree" className="block text-sm font-semibold text-gray-300 mb-2">
                  Degree Program
                </label>
                <CustomDropdown
                  options={loadingDegrees ? [] : [
                    ...degrees.map(degree => ({ value: degree.name, label: degree.name })),
                    { value: 'other', label: 'Other (Not listed above)' }
                  ]}
                  value={selectedDegree}
                  onChange={(value) => {
                    setSelectedDegree(value);
                    if (value === 'other') {
                      setShowOtherDegree(true);
                      setOtherDegree('');
                      setSelectedSpecialization('');
                      setSpecializations([]);
                    } else {
                      setShowOtherDegree(false);
                      setOtherDegree('');
                      // Find the degree ID for fetching specializations
                      const degree = degrees.find(d => d.name === value);
                      if (degree) {
                        fetchSpecializations(degree.id);
                      }
                    }
                  }}
                  placeholder={loadingDegrees ? "Loading degrees..." : "Select your Degree Program"}
                  disabled={loadingDegrees}
                  className="w-full"
                  searchable={true}
                />
              </div>

                              <div>
                <label htmlFor="specialization" className="block text-sm font-semibold text-gray-300 mb-2">
                  Specialization
                </label>
                <CustomDropdown
                  options={
                    !selectedDegree && !otherDegree ? [] :
                    loadingSpecializations ? [] : [
                      ...specializations.map(specialization => ({ 
                        value: specialization.name, 
                        label: specialization.name 
                      })),
                      { value: 'other', label: 'Other (Not listed above)' }
                    ]
                  }
                  value={selectedSpecialization}
                  onChange={(value) => {
                    setSelectedSpecialization(value);
                    if (value === 'other') {
                      setShowOtherSpecialization(true);
                      setOtherSpecialization('');
                    } else {
                      setShowOtherSpecialization(false);
                      setOtherSpecialization('');
                    }
                  }}
                  placeholder={
                    !selectedDegree && !otherDegree ? "Please select a degree first" :
                    loadingSpecializations ? "Loading specializations..." : 
                    "Select your Specialization"
                  }
                  disabled={!selectedDegree && !otherDegree || loadingSpecializations}
                  className="w-full"
                  searchable={true}
                />
              </div>
              </div>

              {/* Other Degree Input */}
              {showOtherDegree && (
                <div className="mt-4 animate-fade-in">
                  <label htmlFor="otherDegree" className="block text-sm font-semibold text-gray-300 mb-2">
                    Enter Degree Program
                  </label>
                  <input
                    type="text"
                    id="otherDegree"
                    value={otherDegree}
                    onChange={(e) => setOtherDegree(e.target.value)}
                    className="w-full px-4 py-3 bg-white/10 text-white border border-white/20 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition-all duration-300 text-base"
                    placeholder="Enter your degree program"
                    required
                  />
                </div>
              )}

              {/* Other Specialization Input */}
              {showOtherSpecialization && (
                <div className="mt-4 animate-fade-in">
                  <label htmlFor="otherSpecialization" className="block text-sm font-semibold text-gray-300 mb-2">
                    Enter Specialization
                  </label>
                  <input
                    type="text"
                    id="otherSpecialization"
                    value={otherSpecialization}
                    onChange={(e) => setOtherSpecialization(e.target.value)}
                    className="w-full px-4 py-3 bg-white/10 text-white border border-white/20 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition-all duration-300 text-base"
                    placeholder="Enter your specialization"
                    required
                  />
                </div>
              )}
            </div>

            {/* Additional Information Section */}
            <div className="bg-white/5 rounded-2xl p-6 border border-white/10 overflow-visible">
              <h3 className="text-lg font-semibold text-amber-300 mb-4 flex items-center gap-2">
                <span className="text-xl">👤</span>
                Additional Information
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Gender */}
                <div>
                  <label htmlFor="gender" className="block text-sm font-semibold text-gray-300 mb-2">
                    Gender
                  </label>
                  <CustomDropdown
                    options={[
                      { value: 'male', label: 'Male' },
                      { value: 'female', label: 'Female' },
                      { value: 'other', label: 'Other' },
                      { value: 'prefer_not_to_say', label: 'Prefer not to say' }
                    ]}
                    value={gender}
                    onChange={setGender}
                    placeholder="Select your gender"
                    className="w-full"
                    searchable={false}
                  />
                </div>

                {/* Phone Number */}
                <div>
                  <label htmlFor="phoneNumber" className="block text-sm font-semibold text-gray-300 mb-2">
                    Phone Number
                  </label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 font-medium">
                      +91
                    </div>
                    <input
                      type="tel"
                      id="phoneNumber"
                      value={phoneNumber}
                      onChange={(e) => {
                        // Only allow numbers and limit to 10 digits
                        const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                        setPhoneNumber(value);
                      }}
                      className="w-full pl-12 pr-4 py-3 bg-white/10 text-white border border-white/20 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition-all duration-300 text-base"
                      placeholder="98765 43210"
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    Enter your 10-digit mobile number (without country code)
                    {phoneNumber && phoneNumber.length === 10 && (
                      <span className="block text-green-400 mt-1">
                        ✓ Will be saved as: +91 {phoneNumber}
                      </span>
                    )}
                  </p>
                </div>

                {/* Graduation Year */}
                <div>
                  <label htmlFor="graduationYear" className="block text-sm font-semibold text-gray-300 mb-2">
                    Expected Graduation Year
                  </label>
                  <CustomDropdown
                    options={(() => {
                      const currentYear = new Date().getFullYear();
                      const years = [];
                      for (let i = currentYear; i <= currentYear + 6; i++) {
                        years.push({ value: i.toString(), label: i.toString() });
                      }
                      return years;
                    })()}
                    value={graduationYear}
                    onChange={setGraduationYear}
                    placeholder="Select graduation year"
                    className="w-full"
                    searchable={false}
                  />
                </div>
              </div>
            </div>

            {/* Submit Button Section */}
            <div className="text-center">
              <Button 
                type="submit" 
                className="w-full max-w-md mx-auto justify-center py-4 px-8 text-lg font-semibold bg-gradient-to-r from-amber-500 to-pink-500 hover:from-amber-600 hover:to-pink-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                disabled={loading || passwordStrength !== 'Strong' || password !== confirmPassword || (!selectedCollege && !otherCollege) || (!selectedDegree && !otherDegree) || (!selectedSpecialization && !otherSpecialization)}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Creating Account...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span>🚀</span>
                    Create Account
                  </div>
                )}
              </Button>
            </div>
          </form>

          <div className="mt-8 text-center">
            <p className="text-gray-300 text-base">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-amber-400 hover:text-amber-300 transition-colors duration-200">
                Sign in here
              </Link>
            </p>
          </div>

          {/* Compact guidance for existing users - only show for account exists errors */}
          {errorType === 'success' && error && (
            <div className="mt-3 p-3 bg-gradient-to-r from-green-400/10 to-blue-400/10 border border-green-400/20 rounded-lg animate-fade-in">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-5 h-5 bg-green-400/20 rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="text-green-300 font-medium text-xs">Welcome back!</p>
              </div>
              <p className="text-green-200 text-xs leading-tight mb-2">
                Great to see you again! Your account is already set up and ready to go.
              </p>
              <Link 
                to="/login" 
                className="inline-flex items-center gap-1 text-green-300 hover:text-green-200 font-medium text-xs"
              >
                <span>Sign In Now</span>
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;