# 📊 AI Blog Monthly Top 30 — 2026-04-16

> Top 30 most impactful articles from the past 30 days, ranked by AI score

---

🥇 **Build your own Dial-up ISP with a Raspberry Pi** — ⭐ 28/30

[Vulnerability Research Is Cooked](https://simonwillison.net/2026/Apr/3/vulnerability-research-is-cooked/#atom-everything) — **simonwillison.net** · 04-03 23:59 · 🔒 安全

> Building a dial-up internet service provider with a Raspberry Pi enables retro computing enthusiasts to connect vintage hardware like the iBook G3 to the web. The Raspberry Pi is configured to emulate dial-up modem connections and bridge them to modern internet via WiFi. Key steps involve setting up pppd software and integrating with devices such as the original Tangerine iBook G3 clamshell. This setup allows old Macs to access the internet through dial-up protocols, preserving the vintage computing experience. The author demonstrates successful web browsing on the iBook with practical examples and images. The project shows how affordable modern components can revive and integrate retro computing systems seamlessly.

🏷️ vulnerability research, AI, security, frontier models

---

🥈 **Google Brags About Android Web Browser Benchmark Scores on Unnamed Devices; Gullible Reporters Fall for It** — ⭐ 28/30

[Quantization from the ground up](https://simonwillison.net/2026/Mar/26/quantization-from-the-ground-up/#atom-everything) — **simonwillison.net** · 03-26 16:21 · 🤖 AI / ML

> Google claims Android is now the fastest mobile platform for web browsing due to deep vertical integration across hardware, the Android OS, and the Chrome engine. The latest flagship Android devices set new performance records in benchmarks like Speedometer, outperforming all other mobile competitors. However, the article critiques this by noting the devices are unnamed and that reporters are gullible for accepting such claims. It argues that benchmark scores can be gamed and may not reflect real-world user experience. The author concludes that this is a marketing ploy rather than a genuine performance achievement.

🏷️ quantization, LLM, AI

---

🥉 **datasette-export-database 0.3a1** — ⭐ 27/30

[Jensen Huang – TPU competition, why we should sell chips to China, & Nvidia’s supply chain moat](https://www.dwarkesh.com/p/jensen-huang) — **dwarkesh.com** · 04-15 15:45 · 🤖 AI / ML

> The datasette-export-database plugin version 0.3a1 addresses a compatibility issue with Datasette 1.0a27. Previously, the plugin relied on the ds_csrftoken cookie for custom signed URLs, but Datasette 1.0a27 no longer sets this cookie. This update modifies the plugin to function without the deprecated cookie, ensuring seamless database exports. Users must upgrade to version 0.3a1 to maintain export functionality with the latest Datasette release.

🏷️ Nvidia, TPU, supply chain, AI chips

---

**4.** **Book Review: Small Comfort by Ia Genberg ★★☆☆☆** — ⭐ 27/30

[Y2K 2.0: The AI security reckoning](https://anildash.com/2026/04/10/y2k-2.0-ai-security/) — **anildash.com** · 04-10 00:00 · 🔒 安全

> Ia Genberg's 'Small Comfort' is a novel composed of interrelated stories told in different narrative styles, akin to the film 'Run Lola Run'. The reviewer praises the conceptual innovation but finds the execution lacking, with morally ambiguous characters and a meandering philosophical discussion about economic salvation. Key elements include a briefcase full of cash and a clash between naïve and cynical perspectives. Despite the ambitious structure, the plot feels unconvincing and poorly integrated. The book receives a two-star rating for failing to deliver a satisfying narrative experience.

🏷️ AI security, vulnerabilities, Y2K

---

**5.** **The Solitaire Shuffle** — ⭐ 27/30

[Writing an LLM from scratch, part 32j -- Interventions: trying to train a better model in the cloud](https://www.gilesthomas.com/2026/04/llm-from-scratch-32j-interventions-trying-to-train-a-better-model-in-the-cloud) — **gilesthomas.com** · 04-09 20:00 · 🤖 AI / ML

> Solitaire extends far beyond the Windows 3.1 version, with countless historical and creative variations. The article traces the origins of Solitaire, detailing how games like Klondike, Spider, and FreeCell evolved from traditional card games. It explores the technical adaptations in digital implementations that popularized specific variants and introduced new challenges. Key findings highlight the cultural impact of Solitaire as a gateway to card games for millions of users. The author concludes that Solitaire's simplicity and adaptability have fueled its enduring popularity and continuous innovation.

🏷️ LLM, training, GPT-2, interventions

---

**6.** **Anthropic Accidentally Leaked the Entire Claude Code CLI Source Code** — ⭐ 27/30

[Anthropic Accidentally Leaked the Entire Claude Code CLI Source Code](https://arstechnica.com/ai/2026/03/entire-claude-code-cli-source-code-leaks-thanks-to-exposed-map-file/) — **daringfireball.net** · 04-06 19:04 · 🔒 安全

> Anthropic accidentally exposed the entire source code for Claude Code CLI through an included source map file. The leak occurred in version 2.1.88 of the npm package, which contained a source map that could be used to reconstruct the source. The codebase consists of almost 2,000 TypeScript files and more than 512,000 lines of code. Security researcher Chaofan Shou publicly disclosed the issue on X, linking to an archive of the files. This incident highlights the risks of including source maps in production builds, potentially compromising proprietary code.

🏷️ security, leak, Claude, source code

---

**7.** **Axios, Super Popular NPM Package, Was Compromised in Attack on the Module’s Maintainer** — ⭐ 27/30

[Axios, Super Popular NPM Package, Was Compromised in Attack on the Module’s Maintainer](https://www.stepsecurity.io/blog/axios-compromised-on-npm-malicious-versions-drop-remote-access-trojan) — **daringfireball.net** · 04-02 18:42 · 🔒 安全

> The axios npm package was compromised through malicious versions published in an attack targeting its maintainer. Specifically, versions axios@1.14.1 and axios@0.30.4 inject a fake dependency, plain-crypto-js@4.2.1, which is not imported in the axios source code. This dependency executes a postinstall script that deploys a cross-platform remote access trojan, contacting a live command-and-control server. The attack is particularly dangerous because there is zero malicious code within axios itself, making detection difficult. Users who installed these versions should assume their systems are compromised and take immediate action.

🏷️ axios, npm, security, attack

---

**8.** **My ramblings are available over gopher** — ⭐ 27/30

[Supply Chain Attack on Axios Pulls Malicious Dependency from npm](https://simonwillison.net/2026/Mar/31/supply-chain-attack-on-axios/#atom-everything) — **simonwillison.net** · 03-31 23:28 · 🔒 安全

> The author criticizes the complexity of accessing their website, which requires a thousand lines of C code for clients. To simplify access, the server supports the gopher protocol, a lightweight alternative to HTTP. An example is provided using telnet to connect to maurycyz.com on port 70, allowing direct retrieval of content like /about.txt. This approach reduces client-side complexity and promotes retro computing practices. The author concludes that gopher offers a more efficient and straightforward method for distributing web content.

🏷️ supply chain attack, Axios, npm

---

**9.** **Book Review: If We Cannot Go at the Speed of Light by Kim Choyeop ★★☆☆☆** — ⭐ 27/30

[Writing an LLM from scratch, part 32g -- Interventions: weight tying](https://www.gilesthomas.com/2026/03/llm-from-scratch-32g-interventions-weight-tying) — **gilesthomas.com** · 03-24 19:50 · 🤖 AI / ML

> The review critiques Kim Choyeop's short story collection 'If We Cannot Go at the Speed of Light' for its narrative flaws. Key criticisms include excessive exposition and infodumping, which overshadow action and natural plot development. This approach renders the stories dreary and insipid, failing to capitalize on the concise engagement typical of short fiction. With a rating of 2 out of 5 stars, the collection is deemed a disappointing read.

🏷️ LLM, weight tying, neural networks

---

**10.** **How Much Computing Power is in a Data Center?** — ⭐ 27/30

[How Much Computing Power is in a Data Center?](https://www.construction-physics.com/p/how-much-computing-power-is-in-a) — **construction-physics.com** · 03-19 12:01 · 🤖 AI / ML

> The article quantifies the computing power housed in modern data centers, driven by AI investments. It examines metrics like total FLOPS, energy consumption, and cost comparisons across hyperscale and enterprise facilities. Key findings include the role of GPU clusters in training large language models and advancements in cooling technologies to increase computing density. The analysis highlights how data center scale has grown exponentially, with some facilities consuming hundreds of megawatts of power. This underscores the critical infrastructure supporting global digital services and AI innovation.

🏷️ data center, computing power, AI, investment

---

**11.** **The Tuesday Test** — ⭐ 26/30

[Gemini 3.1 Flash TTS](https://simonwillison.net/2026/Apr/15/gemini-31-flash-tts/#atom-everything) — **simonwillison.net** · 04-15 17:13 · 🤖 AI / ML

> The Tuesday Test is described as analogous to the Turing test but incorporates tacos as a key element. This concept likely presents a humorous or metaphorical framework for evaluating intelligence or interaction in a more casual context. By adding tacos, it aims to make complex tests more relatable and engaging. The approach may be used to discuss AI, human-computer interaction, or philosophy in an accessible way.

🏷️ Gemini, TTS, text-to-speech

---

**12.** **Gemini 3.1 Flash TTS** — ⭐ 26/30

[Gemini 3.1 Flash TTS](https://simonwillison.net/2026/Apr/15/gemini-flash-tts/#atom-everything) — **simonwillison.net** · 04-15 16:41 · 🤖 AI / ML

> Google's Gemini 3.1 Flash TTS is a new text-to-speech model designed for advanced speech synthesis. The author evaluates its capabilities, noting improvements in naturalness and efficiency for generating speech from text. A custom tool is provided for testing the model, highlighting practical applications in AI-driven interactions. This release aligns with Google's broader AI advancements in multimodal systems. The conclusion is that Gemini 3.1 Flash TTS offers a significant upgrade, making high-quality TTS more accessible for developers and users.

🏷️ Gemini, TTS, tool, API

---

**13.** **Writing an LLM from scratch, part 32k -- Interventions: training a better model locally with gradient accumulation** — ⭐ 26/30

[Writing an LLM from scratch, part 32k -- Interventions: training a better model locally with gradient accumulation](https://www.gilesthomas.com/2026/04/llm-from-scratch-32k-interventions-training-our-best-model-locally-gradient-accumulation) — **gilesthomas.com** · 04-15 20:00 · 🤖 AI / ML

> The author trains a GPT-2-small-style LLM from scratch, focusing on interventions to enhance model performance through local training with gradient accumulation. Key experiments involve modifying architecture and training parameters to reduce loss and improve accuracy. Comparative analysis identifies optimal strategies, such as specific hyperparameter adjustments and code interventions, that yield better results than baseline models. These findings demonstrate how efficient local training can rival cloud-based approaches. The main takeaway is that targeted interventions significantly boost LLM performance, offering a roadmap for cost-effective model development.

🏷️ LLM, training, gradient accumulation

---

**14.** **Quoting John Gruber** — ⭐ 26/30

[datasette 1.0a27](https://simonwillison.net/2026/Apr/15/datasette/#atom-everything) — **simonwillison.net** · 04-15 23:16 · 🛠 工具 / 开源

> John Gruber argues that Apple's key advantage is its platform's superior apps, which draw users to iPhone, Mac, and iPad. He contends this edge is waning because third-party software on Apple platforms is regressing to the mean in quality, not because competing platforms are improving. This decline could reduce Apple's appeal if app ecosystems deteriorate. Gruber emphasizes that sustaining app quality is more vital than transaction cuts for long-term platform success.

🏷️ Datasette, release, CSRF

---

**15.** **Pressed For Options** — ⭐ 26/30

[Trusted access for the next era of cyber defense](https://simonwillison.net/2026/Apr/14/trusted-access-openai/#atom-everything) — **simonwillison.net** · 04-14 21:23 · 🤖 AI / ML

> The article addresses the difficulty of using external fingerprint readers with Linux systems due to limited hardware compatibility. The author purchased a USB fingerprint reader from Temu, as it was the only known device that works reliably with their Linux laptop. This choice highlights the scarcity of supported peripherals for open-source operating systems. The discussion likely covers technical challenges, such as driver issues and community solutions. The main takeaway is that Linux users often resort to unconventional sources for functional biometric hardware.

🏷️ GPT-5.4, cybersecurity, AI

---

**16.** **That’s a Skill Issue** — ⭐ 26/30

[That’s a Skill Issue](https://blog.jim-nielsen.com/2026/skill-issue/) — **blog.jim-nielsen.com** · 04-12 19:00 · 🤖 AI / ML

> The article contrasts responses when LLMs fail to meet user expectations. AI proponents often dismiss issues as user incompetence, calling them 'skill issues'. Human-centered UX designers take responsibility, viewing failures as design flaws requiring improvement. This shift highlights the need for user-centric design in AI tool development. The author references work with Jan Miksovsky to underscore practical applications. Ultimately, it advocates for empathy and better usability over blaming users.

🏷️ AI, LLM, UX

---

**17.** **Kākāpō Parrots** — ⭐ 26/30

[ChatGPT voice mode is a weaker model](https://simonwillison.net/2026/Apr/10/voice-mode-is-weaker/#atom-everything) — **simonwillison.net** · 04-10 15:56 · 🤖 AI / ML

> The article discusses the kākāpō parrot, an endangered flightless bird native to New Zealand. It highlights the species' unique traits, such as being nocturnal and flightless, with a focus on conservation challenges. Key points include the bird's low population, estimated around 200 individuals, and ongoing breeding programs. Conservation efforts are detailed, including predator control and habitat management. The takeaway emphasizes the critical need for continued conservation to prevent extinction.

🏷️ ChatGPT, voice mode, AI model

---

**18.** **The Solitaire Shuffle** — ⭐ 26/30

[Premium: The Hater's Guide to OpenAI](https://www.wheresyoured.at/hatersguide-openai/) — **wheresyoured.at** · 04-10 16:57 · 🤖 AI / ML

> The article explores the game of Solitaire, examining its numerous variations beyond the standard digital versions. It delves into the history of Solitaire, tracing its origins and evolution over time. Key variations such as Spider, FreeCell, and others are compared to the classic Klondike version. The article meditates on the game's enduring popularity and its adaptations across different platforms. The conclusion reflects on Solitaire's cultural significance and its persistence in gaming history.

🏷️ OpenAI, AI ethics, criticism

---

**19.** **Lickspittle of the Week: Todd Blanche** — ⭐ 26/30

[Package Security Defenses for AI Agents](https://nesbitt.io/2026/04/09/package-security-defenses-for-ai-agents.html) — **nesbitt.io** · 04-09 10:00 · 🔒 安全

> Acting Attorney General Todd Blanche is criticized for his obsequious comments toward President Trump. Blanche stated, 'I love working for President Trump. It’s the greatest honor of a lifetime,' and expressed willingness to accept any future assignment without question. The author sarcastically suggests Blanche should say 'Thank you sir, may I have another,' highlighting the sycophantic nature of the remarks. This underscores concerns about blind loyalty in political appointments and the erosion of professional independence. The conclusion is that such behavior undermines the integrity and ethical standards expected in public office.

🏷️ AI agents, security, package management, sandboxing

---

**20.** **Fewer Computers, Fewer Problems: Going Local With Builds & Deployments** — ⭐ 26/30

[Fewer Computers, Fewer Problems: Going Local With Builds & Deployments](https://blog.jim-nielsen.com/2026/fewer-computers-fewer-problems/) — **blog.jim-nielsen.com** · 04-09 19:00 · ⚙️ 工程

> The author is frustrated with remote build services like Netlify due to inconsistencies between local and remote environments, which add unnecessary DevOps overhead. He spends extra time configuring remote Linux servers to ensure builds work, complicating deployments. In 2025, he considers reverting to local builds and pushing deploys directly from his computer to streamline the process. Local builds eliminate dependency on external services and reduce configuration headaches. This approach ensures consistency and simplifies deployment workflows. The main takeaway is that moving back to local builds can save time and avoid problems associated with remote build systems.

🏷️ local builds, deployment, Netlify

---

**21.** **Package Security Problems for AI Agents** — ⭐ 26/30

[Package Security Problems for AI Agents](https://nesbitt.io/2026/04/08/package-security-problems-for-ai-agents.html) — **nesbitt.io** · 04-08 10:00 · 🔒 安全

> AI agents rely on software packages, creating security vulnerabilities through complex dependency chains. Malicious or vulnerable packages can compromise AI systems, leading to data breaches or manipulated outputs. The article discusses mitigation strategies like package verification, secure deployment practices, and monitoring tools. It emphasizes the need for industry standards to address these risks in AI infrastructure. Securing the package ecosystem is critical for ensuring the safe and reliable operation of AI agents.

🏷️ AI agents, package security

---

**22.** **Solar Eclipse From the Far Side of the Moon** — ⭐ 26/30

[Writing an LLM from scratch, part 32i -- Interventions: what is in the noise?](https://www.gilesthomas.com/2026/04/llm-from-scratch-32i-interventions-what-is-in-the-noise) — **gilesthomas.com** · 04-07 21:00 · 🤖 AI / ML

> A photograph from NASA's Artemis II mission captures a solar eclipse as viewed from the far side of the moon. This image is described as one of the most breathtaking astronomical photos ever taken, showcasing the moon blocking the sun from a perspective not visible from Earth. The unique vantage point highlights advancements in space photography and lunar exploration. The author expresses awe at the visual and emphasizes its rarity. Readers are encouraged to follow NASA on Flickr for more stunning space imagery.

🏷️ LLM, GPT-2, training

---

**23.** **Eight years of wanting, three months of building with AI** — ⭐ 26/30

[Eight years of wanting, three months of building with AI](https://simonwillison.net/2026/Apr/5/building-with-ai/#atom-everything) — **simonwillison.net** · 04-05 23:54 · 🤖 AI / ML

> Lalit Maganti spent eight years conceptualizing and three months building syntaqlite, an AI-powered devtool for SQLite. Syntaqlite leverages agentic engineering to create high-fidelity development tools, demonstrating rapid implementation after prolonged ideation. The project highlights how AI can accelerate software development by automating complex tasks. It showcases practical applications of AI in enhancing developer productivity and tool reliability. The author emphasizes the efficiency gains from integrating AI into the building process, turning long-held ideas into functional products. Conclusion: AI significantly speeds up the realization of innovative tech projects, as evidenced by syntaqlite's development timeline.

🏷️ AI, agentic engineering, long-form

---

**24.** **The AI writing witchhunt is pointless.** — ⭐ 26/30

[The AI writing witchhunt is pointless.](https://www.joanwestenberg.com/the-ai-writing-witchhunt-is-pointless/) — **joanwestenberg.com** · 04-04 12:01 · 💡 观点 / 杂谈

> The article critiques the widespread fear and criticism of AI-generated writing as misguided. It parallels this with 19th-century writer Alexandre Dumas, who collaborated with Auguste Maquet, where Maquet produced drafts and Dumas polished them. This historical example demonstrates that collaborative writing processes have long existed. The author contends that AI is merely a contemporary tool for similar creative collaboration. Thus, the witchhunt against AI writing is futile and stems from a misapprehension of how creativity works.

🏷️ AI, writing, ethics

---

**25.** **Apple Still Has Jessica Chastain’s ‘The Savant’ on Ice, Seven Months After It Was Set to Debut** — ⭐ 26/30

[The Axios supply chain attack used individually targeted social engineering](https://simonwillison.net/2026/Apr/3/supply-chain-social-engineering/#atom-everything) — **simonwillison.net** · 04-03 13:54 · 🔒 安全

> Apple's delay of Jessica Chastain's political thriller 'The Savant' for seven months beyond its September debut raises questions about content scheduling. Rescheduled to 'at a later date' without a new window, the delay is criticized as cowardly and vague. The author compares Apple's approach to Donald Trump's 'in two weeks' promises, implying unreliability and lack of commitment. This highlights transparency issues in Apple TV's content rollout and potential erosion of viewer trust. The takeaway is that indefinite delays can harm anticipation and consumer confidence in streaming services.

🏷️ supply chain, Axios, social engineering, security

---

**26.** **Roman moon, Greek moon** — ⭐ 26/30

[Writing an LLM from scratch, part 32h -- Interventions: full fat float32](https://www.gilesthomas.com/2026/04/llm-from-scratch-32h-interventions-full-fat-float32) — **gilesthomas.com** · 04-03 23:50 · 🤖 AI / ML

> The terms 'perilune' and 'periselene' describe the point in an orbit closest to the moon, with origins in Latin and Greek respectively. Used interchangeably in astronomy, these terms are exemplified in NASA's Artemis II mission flight path. The article explains the etymological differences and their application in describing lunar orbits, such as perilune occurring on the moon's far side from Earth. Understanding this dual nomenclature enhances precision in scientific communication about space missions. The main point is that linguistic diversity in terminology enriches comprehension of orbital mechanics and historical context.

🏷️ LLM, GPT-2, float32, training

---

**27.** **It's extremely good that Claude's source-code leaked** — ⭐ 26/30

[Pluralistic: It's extremely good that Claude's source-code leaked (02 Apr 2026)](https://pluralistic.net/2026/04/02/limited-monopoly/) — **pluralistic.net** · 04-02 10:19 · 🤖 AI / ML

> The article argues that the leak of Claude's source code is beneficial, contrary to typical concerns about intellectual property breaches. It suggests such leaks can limit monopolistic control by tech companies, fostering innovation and transparency in AI development. The author connects this to the concept of 'limited monopoly,' warning against the dangers of over-reliance on proprietary systems. This perspective highlights how source code leaks can serve as a check on corporate power and encourage open collaboration. The conclusion is that leaks, while unintended, can have positive outcomes by democratizing access and stimulating competitive advancements.

🏷️ Claude, source-code, leak, AI

---

**28.** **Pluralistic: Trumpismo vs minilateralism** — ⭐ 26/30

[What is Copilot exactly?](https://idiallo.com/blog/what-is-copilot-exactly?src=feed) — **idiallo.com** · 04-01 12:00 · 🤖 AI / ML

> The article contrasts Trumpismo, characterized by unilateral and nationalist policies, with minilateralism, which involves cooperative agreements among small groups of countries. It argues that adversaries inevitably influence global outcomes, necessitating adaptive strategies beyond rigid ideological approaches. Minilateralism is presented as a pragmatic solution for addressing specific issues like DRM and Netflix disruptions without the inefficiencies of broader multilateralism. The author references technological examples to illustrate how economic forces shape international relations. The conclusion advocates for selective, flexible cooperation over isolationist tendencies in a complex world.

🏷️ Copilot, AI, programming

---

**29.** **Summary of reading: January - March 2026** — ⭐ 26/30

[The Subprime AI Crisis Is Here](https://www.wheresyoured.at/the-subprime-ai-crisis-is-here/) — **wheresyoured.at** · 03-31 16:18 · 🤖 AI / ML

> The author summarizes books read in the first quarter of 2026, starting with Thomas Sowell's 'Intellectuals and Society'. Sowell's work critiques left-leaning intellectuals, noting its bias and focus on 20th-century history, which the author finds reflective of recurring patterns. Other readings are briefly mentioned, suggesting a range of intellectual topics. The conclusion emphasizes that such books offer insights into historical continuity and contemporary debates. Overall, the summary serves as a personal reflection on engaging with biased yet thought-provoking literature.

🏷️ AI, crisis, analysis

---

**30.** **Pluralistic: State Dems must stop ICE from stealing the midterms (31 Mar 2026)** — ⭐ 26/30

[npm’s Defaults Are Bad](https://nesbitt.io/2026/03/31/npms-defaults-are-bad.html) — **nesbitt.io** · 03-31 10:00 · 🔒 安全

> The article focuses on the need for State Democrats to prevent ICE from interfering in midterm elections. It argues that ICE's actions could undermine electoral integrity, urging Democrats to take minimal necessary steps to counter this. Additional links cover diverse topics such as power-strip bugs, Disney font piracy, and political strategies involving Trump. The author's main takeaway is that immediate action is required to safeguard democracy from enforcement agency overreach.

🏷️ npm, supply chain security, JavaScript

---

*Generated at 2026-04-16 08:22 | Scanned 30 daily digests · 535 articles parsed · Top 30 selected from past 30 days*
*Based on [Hacker News Popularity Contest 2025](https://refactoringenglish.com/tools/hn-popularity/) RSS feed list, recommended by [Andrej Karpathy](https://x.com/karpathy)*
