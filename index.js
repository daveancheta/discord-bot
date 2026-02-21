import ollama from "ollama";
import { REST, Routes } from 'discord.js';
import { Client, Events, GatewayIntentBits } from 'discord.js';
import "dotenv/config"

const TOKEN = process.env.TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;

const commands = [
    {
        name: 'ask',
        description: 'Ask Hiccup anything.',
        options: [
            {
                name: "question",
                type: 3,
                description: "question",
                required: true
            }
        ]
    },
];

// Get current Philippine Time in 12-hour format
const now = new Date();
const phtTime = now.toLocaleString("en-PH", {
  timeZone: "Asia/Manila",
  hour12: true,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit"
});

const bot_instruction = `
Current Philippine Time (PHT, 12-hour format): ${phtTime}

You are Hiccup, a friendly AI assistant.

If the user asks how to use Hiccup, respond: "Type /ask and then ask your question."

If the user asks "Who are you?", respond: "I am Hiccup, a friendly AI assistant created by Heaven Dave Ancheta."

Rules:
- Keep responses under 2000 characters.
- Base time-related answers on Philippine Standard Time (PHT).
- If asked who your creator is, answer: "Mr. Heaven Dave Ancheta" and include a link to his portfolio: https://daveancheta.vercel.app
- Answer all questions in a friendly and professional tone.

About Heaven Dave Ancheta:
Full-stack developer from the Philippines specializing in modern web applications.
Birthday: August 27, 2005 (20 years old in 2026)
Current Status: 3rd-year student, currently learning AI/ML

Heaven Dave Ancheta Tech Stack:
Frontend: JavaScript, TypeScript, React, Next.js, Tailwind CSS, Bootstrap, Framer Motion, Styled Components
Backend: Node.js, Express, Laravel, CodeIgniter, JWT, REST APIs
Databases: PostgreSQL, MongoDB, MySQL, SQLite
ORMs: Drizzle, Prisma, Eloquent
Deployment: Vercel, Railway, Neon, Cloudinary, Resend
Tools: Git, GitHub, VS Code, Figma, Discord
`;

const rest = new REST({ version: '10' }).setToken(TOKEN);

try {
    console.log('Started refreshing application (/) commands.');

    await rest.put(Routes.applicationCommands(CLIENT_ID), { body: commands });

    console.log('Successfully reloaded application (/) commands.');
} catch (error) {
    console.error(error);
}

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.on(Events.ClientReady, readyClient => {
    console.log(`Logged in as ${readyClient.user.tag}!`);
});

client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName === 'ask') {
        const question = interaction.options.getString("question")

        await interaction.deferReply()

        const prompt = `
                Answer the user’s question based on these instructions:
                ${bot_instruction}

                User Question: ${question}
                `;

        try {
            const response = await ollama.chat({
                model: 'llama3.2',
                messages: [{ role: 'user', content: prompt }],
            })

            await interaction.editReply(response.message.content);
        } catch (error) {
            console.log(error)
            await interaction.reply("Oops! I can’t answer that at the moment.")
        }
    }
});

client.login(TOKEN);