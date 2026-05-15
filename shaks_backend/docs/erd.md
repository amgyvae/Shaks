# Shaks LMS — Entity Relationship Diagram

```
┌──────────────────────────────────────────────────────────────────────────┐
│                          SHAKS LMS — ERD                                  │
└──────────────────────────────────────────────────────────────────────────┘

┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│    Grade    │       │   Subject   │       │    User     │
│─────────────│       │─────────────│       │─────────────│
│ id (PK)     │       │ id (PK)     │       │ id (PK)     │
│ name        │       │ name        │       │ phone_number│
└──────┬──────┘       │ description │       │ email       │
       │              │ created_by─►│──────►│ full_name   │
       │              └──────┬──────┘       │ role        │
       │                     │              │ grade ──────┘
       │              ┌──────▼──────┐       │ avatar      │
       └─────────────►│   Module    │       │ preferred_  │
                       │─────────────│       │   language  │
                       │ id (PK)     │       │ timezone    │
                       │ title       │       │ is_active   │
                       │ subject(FK) │       │ is_staff    │
                       │ grade (FK)  │       │ date_joined │
                       │ order       │       └─────────────┘
                       └──────┬──────┘
                              │
                       ┌──────▼──────┐       ┌─────────────┐
                       │    Topic    │       │  Assignment │
                       │─────────────│       │─────────────│
                       │ id (PK)     │◄──────│ topic (FK)  │
                       │ title       │       │ title       │
                       │ module (FK) │       │ instructions│
                       │ video_url   │       │ points      │
                       │ explanation │       │ due_date    │
                       │ order       │       │ created_by  │
                       └──────┬──────┘       └──────┬──────┘
                              │                     │
                    ┌─────────┴──────┐      ┌───────▼──────┐
                    │     Quiz       │      │  Submission  │
                    │────────────────│      │──────────────│
                    │ id (PK)        │      │ student (FK) │
                    │ topic (FK)     │      │ assignment   │
                    │ question       │      │ file         │
                    │ option_a/b/c/d │      │ status       │
                    │ correct_answer │      │ feedback     │
                    └───────┬────────┘      │ grade        │
                            │               └──────────────┘
                   ┌────────▼───────┐
                   │  QuizAttempt   │
                   │────────────────│
                   │ student (FK)   │
                   │ quiz (FK)      │
                   │ answer         │
                   │ is_correct     │
                   └────────────────┘

┌─────────────┐       ┌─────────────┐       ┌──────────────┐
│  ChatRoom   │       │ ChatMessage │       │ Notification │
│─────────────│       │─────────────│       │──────────────│
│ id (PK)     │◄──────│ room (FK)   │       │ recipient FK │
│ teacher(FK) │       │ sender (FK) │       │ title        │
│ student(FK) │       │ content     │       │ body         │
└─────────────┘       │ sent_at     │       │ is_read      │
                      │ is_read     │       │ created_at   │
                      └─────────────┘       └──────────────┘

┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│    Post     │       │   Comment   │       │    Like     │
│─────────────│       │─────────────│       │─────────────│
│ id (PK)     │◄──────│ post (FK)   │       │ user (FK)   │
│ author (FK) │       │ author (FK) │       │ post (FK)   │
│ text        │       │ text        │       │ created_at  │
│ image       │◄──────└─────────────┘       └─────────────┘
│ created_at  │       
└─────────────┘       

┌──────────────────┐  ┌────────────────┐  ┌──────────────┐
│   Announcement   │  │    Meeting     │  │  VideoWatch  │
│──────────────────│  │────────────────│  │──────────────│
│ author (FK)      │  │ title          │  │ student (FK) │
│ title            │  │ description    │  │ topic (FK)   │
│ body             │  │ meeting_link   │  │ watched_at   │
│ created_at       │  │ scheduled_at   │  └──────────────┘
└──────────────────┘  │ created_by(FK) │
                      └────────────────┘
```
