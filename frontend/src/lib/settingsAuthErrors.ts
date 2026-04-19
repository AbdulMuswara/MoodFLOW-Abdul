export function authErrorMessage(code: string): string {
  switch (code) {
    case "auth/wrong-password":
    case "auth/invalid-credential":
      return "Current password is incorrect.";
    case "auth/requires-recent-login":
      return "For security, please sign out and sign in again, then try once more.";
    case "auth/weak-password":
      return "Password is too weak. Use at least 6 characters.";
    case "auth/provider-already-linked":
      return "A password is already set on this account.";
    case "auth/credential-already-in-use":
      return "This email or password is already used by another account.";
    case "auth/email-already-in-use":
      return "This email is already associated with another account.";
    case "auth/popup-closed-by-user":
      return "Google sign-in was cancelled.";
    default:
      return "Something went wrong. Please try again.";
  }
}
