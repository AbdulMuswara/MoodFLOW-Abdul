## High-Level Component Diagram

<img width="1376" height="768" alt="image" src="https://github.com/user-attachments/assets/2d18653e-30d6-46b4-b286-71b91f6413fc" />



MoodFLOW is built around a browser web client that talks to three separate pieces over HTTPS using JSON. The Next.js frontend for pages and UI logic, an Express / Node.js app server that runs mood analysis for scoring text and emoji input, and Firebase (Firestore + Auth) for sign-in and storing user data.



## Entity Diagram 

<img width="1376" height="768" alt="image2" src="https://github.com/user-attachments/assets/351b903d-0d40-45ad-b998-e91295285a7c" />


The layer is modeled as a User document in the top-level users collection (key by uid) with profile fields for email, username, verification flags, timestamps, and optional profile text. Each user owns many MoodEntry documents in the nested moodEntries subcollection, with auto-generated entryId and linked back to the user through parentUserUid. This is a one-to-many relationship since one user record can have any number of mood logs over time.

## Call Sequence Diagram 

<img width="1005" height="371" alt="image" src="https://github.com/user-attachments/assets/1d5763c4-f245-45bd-87b2-e78f0b562ab6" />



The flow starts when the user enters mood information in the MoodFLOW web app and chooses Save. The frontend captures the emoji score and note text, then sends a POST /analyzeMood request to the Mood API so the backend can compute a score before anything is written to the database.

The Mood API forwards the request to MoodAnalyzer by calling getAugmentedMoodScore(text, emojiScore). The analyzer returns a moodScore, which the API sends back to the client as a 200 OK response with that value.

After the client receives moodScore, it writes a new document to Firestore with addDoc under users/{uid}/moodEntries, including emoji score, computed mood score, note, and server timestamp. When Firestore confirms the write, the app shows a success message and refreshes recent entries so the user immediately sees the new log in the UI.
