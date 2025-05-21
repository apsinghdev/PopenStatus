import { useState, useEffect } from 'react'
import { useSignIn, useSignUp, useOrganization } from '@clerk/clerk-react'
import { useSearchParams } from 'react-router-dom'

const InvitationHandler = () => {
  const { isLoaded, signUp, setActive: setActiveSignUp } = useSignUp()
  const { signIn, setActive: setActiveSignIn } = useSignIn()
  console.log("signIn", signIn)
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [password, setPassword] = useState('')
  const { organization } = useOrganization()
  console.log("organization in invitation handler", organization)
  // Get the token and account status from the query params
  const [searchParams] = useSearchParams()
  const token = searchParams.get('__clerk_ticket')
  const accountStatus = searchParams.get('__clerk_status')

  // If there is no invitation token, restrict access to this page
  if (!token) {
    return <p>No invitation token found.</p>
  }

  // Handle sign-in
  useEffect(() => {
    if (!signIn || !setActiveSignIn || !token || organization || accountStatus !== 'sign_in') {
      return
    }

    const createSignIn = async () => {
      try {
        // Create a new `SignIn` with the supplied invitation token.
        const signInAttempt = await signIn.create({
          strategy: 'ticket',
          ticket: token as string,
        })

        // If the sign-in was successful, set the session to active
        if (signInAttempt.status === 'complete') {
          await setActiveSignIn({
            session: signInAttempt.createdSessionId,
          })
        } else {
          console.error(JSON.stringify(signInAttempt, null, 2))
        }
      } catch (err) {
        console.error('Error:', JSON.stringify(err, null, 2))
      }
    }

    createSignIn()
  }, [signIn, token, organization, accountStatus, setActiveSignIn])

  // Handle submission of the sign-up form
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isLoaded) return

    try {
      const signUpAttempt = await signUp.create({
        strategy: 'ticket',
        ticket: token,
        firstName,
        lastName,
        password,
      })

      if (signUpAttempt.status === 'complete') {
        await setActiveSignUp({ session: signUpAttempt.createdSessionId })
      } else {
        console.error(JSON.stringify(signUpAttempt, null, 2))
      }
    } catch (err) {
      console.error(JSON.stringify(err, null, 2))
    }
  }

  if (accountStatus === 'sign_in' && !organization) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Signing you in...</h1>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        </div>
      </div>
    )
  }

  if (accountStatus === 'sign_up' && !organization) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-lg">
          <h1 className="text-2xl font-bold text-center mb-8">Complete Your Sign Up</h1>
          <form onSubmit={handleSignUp} className="space-y-6">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                First Name
              </label>
              <input
                id="firstName"
                type="text"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                Last Name
              </label>
              <input
                id="lastName"
                type="text"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              Complete Sign Up
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Organization invitation accepted!</h1>
        <p className="text-gray-600 mb-4">You can now access your organization dashboard.</p>
      </div>
    </div>
  )
}

export default InvitationHandler 