Code Crush Hackathon Project 2026

Theme: Blueprint

Whether it's a robust backend to some software system or a distributed cloud app, every engineering masterpiece begins with a vague human notion. Yet, there lies a huge gap between free-form AI dumps and structured development. Thousands of wasted developer hours are spent on converting their ideas to a structured schema, tracking task dependencies, and estimating timelines before they even write their first line of code. That's why I created Breakdown, an engineering tool capable of removing the cognitive overhead and delivering structured product concepts instantly from raw thoughts. What it does Breakdown is a sleek, dark theme-based workspace that compiles raw directives into a structured Compiled Architecture Matrix.

Users can type or dictate the goals of their project using a built-in voice module. The system immediately distills ideas into a top-level Item, analyzing them through automated algorithms and generating a Feasibility Score and Realism Metric. It divides projects into granular, prioritized Steps, while automatically outlining estimated timelines and target implementation complexities. With a single click, it creates an interactive dependency graph that visually displays the exact structure and order of tasks that need to be completed first.

I developed the application from scratch using a lightweight and fast stack:

Frontend: Standard HTML5, adaptive CSS variables, and native JavaScript. I used the Web Speech API for voice dictation and Cytoscape.js to dynamically render and manage node dependency graphs.

Backend: A Node.js and Express-based architecture handling structured API endpoints.

Database and AI Layer: I integrated the Gemini API for advanced parsing and structural analysis. Under normal conditions, session history logs are managed through Prisma ORM connected to a cloud PostgreSQL relational database.

