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

        try {
            const response = await ollama.chat({
                model: 'llama3.2',
                messages: [{ role: 'user', content: question }],
            })

            await interaction.editReply(response.message.content);
        } catch (error) {
            console.log(error)
            await interaction.reply("Oops! I can’t answer that at the moment.")
        }
    }
});

client.login(TOKEN);