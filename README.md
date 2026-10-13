# AI Pulse Hub

Create a complete, premium, responsive web application called:

AI PULSE — AI LEARNING HUB

for students of:

Madanapalle Institute of Technology & Science (MITS)

Use the two uploaded images as references:

The AI PULSE event poster — use this as the primary visual/design reference.

The uploaded MITS college logo — use this exact logo throughout the website.

IMPORTANT:

Do not recreate, redraw, modify, distort or replace the MITS logo.

Use the uploaded official MITS logo asset exactly as provided while maintaining its original proportions.

1. PROJECT TECHNOLOGY

Build the project using:

React

TypeScript

Vite

Tailwind CSS

Modern reusable React components

Lucide icons or another suitable icon library

Prepare the project for future integration with:

Firebase Authentication

Firebase Firestore

GitHub

Vercel

Do NOT create a separate backend server.

Do NOT use fake authentication.

Do NOT use fake student data.

Do NOT use fake meeting data.

For the first stage, build the complete UI and application structure. Firebase integration will be connected afterward.

2. BRANDING

The main identity is:

AI PULSE

AI LEARNING HUB

Tagline:

LEARN • EXPLORE • INNOVATE

Institution:

MADANAPALLE INSTITUTE OF TECHNOLOGY & SCIENCE

Use the uploaded AI PULSE poster as the design inspiration.

Use the uploaded MITS logo as the official college logo.

3. DESIGN STYLE

Create a premium futuristic AI university-club aesthetic.

Use:

Deep black background

Dark navy

Electric blue

Cyan

Purple

Magenta

Gold/yellow accents

Neon borders

AI neural-network visuals

Circuit-board patterns

Glassmorphism

Subtle gradients

Premium typography

Soft glowing effects

Modern cards

The website should feel like a professional university AI community platform.

It should NOT look like a generic SaaS template.

Do not simply place the poster as the website background.

Instead, translate the poster's visual identity into a proper modern web design.

Keep readability high.

4. WEBSITE ROUTES

Create these routes:

/

/about

/meetings

/join

/login

/student/dashboard

/admin/login

/admin/dashboard

Use proper client-side routing.

The project must later work correctly when deployed to Vercel.

5. NAVBAR

Create a premium responsive navbar.

Left side:

Official MITS logo

AI PULSE

Navigation:

Home
About
Meetings

Right side:

JOIN AI LEARNING HUB
LOGIN

On mobile:

Use a hamburger menu.

The navbar should use a subtle glass/blur effect.

Keep the MITS logo properly proportioned.

6. HOME PAGE

Create a premium futuristic hero section.

Display:

AI PULSE

AI LEARNING HUB

LEARN • EXPLORE • INNOVATE

Description:

A student-driven AI community where students can learn, explore emerging technologies, discover practical AI tools and build innovative ideas together.

Primary button:

JOIN AI LEARNING HUB

Secondary button:

VIEW MEETINGS

The JOIN button MUST navigate to:

/join

The VIEW MEETINGS button MUST navigate to:

/meetings

Create a futuristic AI neural-network/circuit visual inspired by the uploaded poster.

Use subtle animations.

7. ABOUT AI LEARNING HUB

Create a section explaining:

AI Learning Hub is a student-focused community designed to help students understand Artificial Intelligence through learning, practical exploration, workshops, tools, discussions and collaborative activities.

Use premium glassmorphism cards.

Heading:

ABOUT AI LEARNING HUB

8. WHAT WE DO

Create four premium feature cards.

AI LEARNING

Learn AI concepts, technologies and practical applications.

AI TOOLS

Discover useful AI tools for coding, academics, creativity, productivity and research.

AI NEWS

Stay updated with important developments in Artificial Intelligence.

AI COMMUNITY

Connect with students interested in AI and participate in workshops, activities and discussions.

Use futuristic icons.

9. UPCOMING MEETINGS

Create:

UPCOMING MEETINGS

This section will eventually load meetings from Firebase Firestore.

For now, DO NOT use fake meeting data.

Show an attractive empty state:

No upcoming meetings scheduled yet.

Create reusable meeting-card components that will later support:

Meeting title

Description

Date

Start time

End time

Venue

Classroom

Speaker / Faculty

Status

Button:

VIEW ALL MEETINGS

Navigate to:

/meetings

10. WHY JOIN

Create a section:

WHY JOIN AI LEARNING HUB?

Benefits:

Practical AI Exposure

AI Workshops

AI Tools

Student Community

Project Opportunities

Learning Resources

Use attractive futuristic cards.

11. JOIN CLUB FLOW

This is extremely important.

Whenever a user clicks:

JOIN AI LEARNING HUB

or

JOIN CLUB

they MUST be taken to:

/join

Do not open an external page.

Do not use a popup-only registration form.

Create a dedicated registration page.

The intended future flow is:

JOIN CLUB

↓

REGISTRATION

↓

ACCOUNT CREATED

↓

LOGIN

↓

STUDENT DASHBOARD

12. REGISTRATION PAGE

Route:

/join

Heading:

JOIN AI LEARNING HUB

Subtitle:

Become a member of the AI Learning Hub community.

Display the official MITS logo.

Create a premium registration form.

Fields:

Full Name

Roll Number

College Email

Phone Number

Branch

Year

Section

Password

Confirm Password

Buttons:

JOIN AI LEARNING HUB

Also provide:

Already have an account? Login

Login link must navigate to:

/login

For this first frontend stage, create the complete form UI and validation structure.

Do NOT create fake account creation.

Firebase Authentication will be connected later.

13. LOGIN PAGE

Route:

/login

Display the official MITS logo.

Heading:

WELCOME BACK

Subheading:

AI LEARNING HUB

Fields:

College Email
Password

Button:

LOGIN

Links:

Forgot Password?

and:

Don't have an account? Join AI Learning Hub

The registration link must navigate to:

/join

Firebase Authentication will be connected later.

Do not create hardcoded credentials.

14. STUDENT DASHBOARD

Route:

/student/dashboard

Build the complete student dashboard UI.

For the initial frontend stage, show an appropriate empty/loading state rather than fake student information.

Future dashboard should contain:

WELCOME, [STUDENT NAME]

Student profile:

Name

Roll Number

Email

Branch

Year

Section

Section:

UPCOMING MEETINGS

Meeting information will later come from Firestore.

Another section:

MY PROFILE

And:

LOGOUT

Prepare the dashboard so Firebase Authentication can be connected later.

15. MEETINGS PAGE

Route:

/meetings

Create:

UPCOMING MEETINGS

and

PAST MEETINGS

Do not create fake events.

Use a professional empty state until Firebase is connected.

Create reusable meeting cards supporting:

Title
Description
Date
Time
Venue
Classroom
Speaker / Faculty
Status

16. ADMIN LOGIN

Route:

/admin/login

Create a professional admin login page.

Display MITS logo.

Heading:

AI LEARNING HUB ADMIN

Fields:

Email
Password

Button:

SIGN IN

Display:

Admin access only

Do NOT implement fake authentication.

Firebase Authentication will be used later.

17. ADMIN DASHBOARD

Route:

/admin/dashboard

Create the complete admin dashboard UI.

Do not use fake statistics or fake students.

Dashboard cards:

TOTAL STUDENTS

UPCOMING MEETINGS

PAST MEETINGS

Initially show empty/zero states.

18. STUDENT MANAGEMENT

Create an admin student-management interface.

Table columns:

Name
Roll Number
Email
Phone
Branch
Year
Section
Registered At
Actions

Add:

Search
Filter by branch
Filter by year
Filter by section
Sort
Export CSV

Do not insert fake student records.

Prepare the UI for Firestore data.

19. MEETING MANAGEMENT

Create a complete admin meeting management interface.

Admin should eventually be able to:

ADD MEETING

EDIT MEETING

DELETE MEETING

Meeting fields:

Meeting Title

Description

Date

Start Time

End Time

Venue

Classroom

Speaker / Faculty

Status

Statuses:

Upcoming
Completed
Cancelled

For now, build the complete UI only.

Firebase will later provide the actual functionality.

20. ADMIN SIDEBAR

Create:

Dashboard
Students
Meetings
Settings
Logout

Use the same AI PULSE visual language.

21. FOOTER

Create a premium footer.

Display:

Official MITS logo

AI PULSE

AI LEARNING HUB

Madanapalle Institute of Technology & Science

Links:

Home
About
Meetings
Join

Website:

mits.ac.in

Do not invent social media accounts.

22. LOGO REQUIREMENT

The uploaded MITS logo is the official logo.

Use the uploaded image asset.

It must appear in:

Navbar

Registration page

Login page

Student dashboard

Admin login

Footer where appropriate

Maintain its original aspect ratio.

Do NOT:

Recreate the logo

Generate another logo

Change its colors

Alter its Telugu text

Stretch it

Replace it with an icon

23. RESPONSIVE DESIGN

The website must work properly on:

Desktop

Laptop

Tablet

Mobile

Pay special attention to:

Navbar

Hero

Registration form

Login form

Meeting cards

Admin dashboard

Student dashboard

Tables

Convert tables to responsive layouts on mobile.

24. ANIMATIONS

Use subtle premium animations:

Fade-in

Slide-up

Hover glow

Card hover

Button animations

Background particles

Neural-network movement

Do not overuse animations.

Prioritize performance.

25. COMPONENT ARCHITECTURE

Use reusable components.

Suggested structure:

components/
pages/
layouts/
hooks/
lib/
types/

Create reusable components such as:

Navbar
Footer
Hero
FeatureCard
MeetingCard
CTASection
RegistrationForm
LoginForm
AdminSidebar
StatCard
StudentTable
MeetingTable

Keep Firebase-related logic isolated so it can be added later.

26. FUTURE FIREBASE STRUCTURE

Prepare TypeScript types/interfaces for:

Student
Meeting
Admin

Future Firestore collections:

students

meetings

Future Firebase Authentication:

Email/password authentication.

Do not connect Firebase yet.

27. FUTURE STUDENT FLOW

The final application must support:

Student visits website

↓

Clicks JOIN AI LEARNING HUB

↓

Registration page

↓

Creates Firebase account

↓

Student profile stored in Firestore

↓

Registration successful

↓

Login page

↓

Student logs in

↓

Student Dashboard

↓

Can view upcoming meetings

↓

Can logout

28. FUTURE ADMIN FLOW

Admin visits:

/admin/login

↓

Firebase Authentication

↓

Admin authorization

↓

Admin Dashboard

↓

View registered students

↓

Search/filter students

↓

Export student data

↓

Add meeting

↓

Edit meeting

↓

Delete/cancel meeting

↓

Meeting automatically appears on student website

29. SECURITY PREPARATION

The final Firebase implementation must NOT store passwords in Firestore.

Passwords must be handled only by Firebase Authentication.

Students must not be able to access admin functionality.

Students must only access their own profile.

Admin authorization must eventually be enforced using Firebase security rules, not only frontend route protection.

30. VERCEL PREPARATION

The final project MUST be deployable to Vercel.

Use Vite.

Ensure:

npm install

and:

npm run build

work correctly.

Do not use localhost-specific production URLs.

Do not hardcode secrets.

Prepare the application for Firebase environment variables later.

Final deployment architecture:

Lovable

↓

GitHub

↓

Vercel

with:

Firebase Authentication + Firestore

as the backend services.

31. IMPORTANT

Do not add:

Fake students

Fake meetings

Fake statistics

Fake authentication

Hardcoded passwords

Invented faculty information

Invented university information

Random stock images

Unnecessary sections

The final design must feel like:

MITS + AI PULSE + AI LEARNING HUB

Create a premium, futuristic, professional student AI community website.

FIRST PRIORITY:

Excellent frontend design + responsive UI + clean architecture + correct navigation flow.

Firebase integration will be implemented in the next stage.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/3043da68-e990-4da9-9608-ca16ed18df13).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
