---
title: Building effective agents
description: Anthropic年底针对Agent的总结，很值得一看
tag:
 - LLM
 - Anthropic
 - Agent
recommend: 5
hidden: false
sticky: 1
author: Anthropic
cover: https://resource.libx.fun/pic/2024/12/build_effective_agents.png
date: 2024-12-20
---
# Building effective agents

## 转载说明

该篇文章对2024年大模型领域的实际落地场景做了一个很好的总结,给出了一些可行的落地思路参考.
原文地址: https://www.anthropic.com/research/building-effective-agents

---

Over the past year, we've worked with dozens of teams <abbr title="构建大型语言模型（LLM）代理">building large language model (LLM) agents</abbr> across industries. Consistently, the most successful <abbr title="实施">implementations</abbr> weren't using <abbr title="复杂的框架">complex frameworks</abbr> or <abbr title="专门的库">specialized libraries</abbr>. Instead, they were building with simple, <abbr title="可组合的模式">composable patterns</abbr>.

In this post, we <abbr title="分享我们学到的">share what we’ve learned</abbr> from <abbr title="与客户合作">working with our customers</abbr> and <abbr title="自己构建代理">building agents ourselves</abbr>, and <abbr title="给出实用的建议">give practical advice</abbr> for developers on <abbr title="构建具备生产力的智能体">building effective agents</abbr>.

## What are agents?
"Agent" can be <abbr title="定义">defined</abbr> in several ways. Some customers <abbr title="将智能体定义为">define agents as</abbr> fully <abbr title="自主的">autonomous</abbr> systems that <abbr title="独立运作">operate independently</abbr> over <abbr title="较长的时期">extended periods</abbr>, using various <abbr title="工具">tools</abbr> to <abbr title="完成复杂的任务">accomplish complex tasks</abbr>. Others use the <abbr title="术语">term</abbr> to <abbr title="描述">describe</abbr> more <abbr title="规范的">prescriptive</abbr> <abbr title="执行">implementations</abbr> that follow <abbr title="预先定义的工作流">predefined workflows</abbr>. At Anthropic, we <abbr title="把所有这些变化归类为">categorize all these variations as</abbr> agentic systems, but <abbr title="在工作流和智能体之间做出重要的架构区别">draw an important architectural distinction between</abbr> workflows and agents:

- Workflows are systems where LLMs and tools are <abbr title="通过预定义的代码路径协调">orchestrated through predefined code paths</abbr>.

- Agents, on the other hand, are systems where LLMs <abbr title="动态地指导他们自己的过程">dynamically direct their own processes</abbr> and tool usage, <abbr title="保持对其如何完成任务的控制">maintaining control over how they accomplish tasks</abbr>.

Below, we will <abbr title="详细探索">explore</abbr> both types of agentic systems in detail. In Appendix 1 (“Agents in Practice”), we <abbr title="描述了客户发现使用这些系统特别有价值的两个领域">describe two domains where customers have found particular value in using these kinds of systems</abbr>.

## When (and when not) to use agents
When <abbr title="构建">building</abbr> applications with LLMs, we <abbr title="建议">recommend</abbr> finding the <abbr title="最简单的">simplest</abbr> solution possible, and only <abbr title="增加复杂性">increasing complexity</abbr> when <abbr title="需要">needed</abbr>. This might mean not <abbr title="构建智能体系统">building agentic systems</abbr> at all. Agentic systems often <abbr title="牺牲延迟和成本来换取更好的任务表现">trade latency and cost for better task performance</abbr>, and you should <abbr title="考虑何时这种权衡是有意义的">consider when this tradeoff makes sense</abbr>.

When more complexity is <abbr title="被证明是正当的">warranted</abbr>, workflows offer <abbr title="可预测性">predictability</abbr> and <abbr title="一致性">consistency</abbr> for <abbr title="定义明确的任务">well-defined tasks</abbr>, whereas agents are the better <abbr title="选择">option</abbr> when <abbr title="灵活性">flexibility</abbr> and <abbr title="模型驱动的决策">model-driven decision-making</abbr> are needed at <abbr title="规模">scale</abbr>. For many applications, however, <abbr title="优化带有检索和上下文示例的单次LLM调用">optimizing single LLM calls with retrieval and in-context examples</abbr> is usually enough.

## When and how to use frameworks
There are many <abbr title="框架">frameworks</abbr> that make agentic systems easier to <abbr title="实现">implement</abbr>, including:

- LangGraph from LangChain;
- Amazon Bedrock's AI Agent framework;
- Rivet, a drag and drop GUI LLM <abbr title="工作流程构建器">workflow builder</abbr>; and
- Vellum, another GUI tool for building and testing <abbr title="复杂的工作流程">complex workflows</abbr>.
These frameworks make it easy to get started by <abbr title="简化标准的底层任务">simplifying standard low-level tasks</abbr> like <abbr title="调用LLM">calling LLMs</abbr>, <abbr title="定义和解析工具">defining and parsing tools</abbr>, and <abbr title="将调用链接在一起">chaining calls together</abbr>. However, they often create extra layers of <abbr title="抽象">abstraction</abbr> that can <abbr title="掩盖底层提示和响应">obscure the underlying prompts and responses</abbr>, making them harder to <abbr title="调试">debug</abbr>. They can also make it <abbr title="诱人地">tempting</abbr> to add complexity when a simpler <abbr title="设置">setup</abbr> would <abbr title="足够">suffice</abbr>.

We suggest that developers start by using LLM APIs directly: many <abbr title="模式">patterns</abbr> can be implemented in a few lines of code. If you do use a framework, <abbr title="确保你理解底层代码">ensure you understand the underlying code</abbr>. <abbr title="关于底层代码的不正确的假设">Incorrect assumptions about what's under the hood</abbr> are a <abbr title="常见的客户错误来源">common source of customer error</abbr>.

See our cookbook for some sample <abbr title="实现">implementations</abbr>.

## Building blocks, workflows, and agents
In this section, we’ll <abbr title="探索">explore</abbr> the <abbr title="常见模式">common patterns</abbr> for <abbr title="代理系统">agentic systems</abbr> we’ve seen in <abbr title="生产环境">production</abbr>. We'll start with our <abbr title="基础构建模块">foundational building block</abbr>—the <abbr title="增强型大型语言模型">augmented LLM</abbr>—and <abbr title="逐步增加">progressively increase</abbr> <abbr title="复杂度">complexity</abbr>, from <abbr title="简单的组合工作流程">simple compositional workflows</abbr> to <abbr title="自主代理">autonomous agents</abbr>.

### Building block: The augmented LLM
The <abbr title="基本构建模块">basic building block</abbr> of <abbr title="代理系统">agentic systems</abbr> is an LLM <abbr title="增强">enhanced</abbr> with <abbr title="扩展功能">augmentations</abbr> such as <abbr title="检索">retrieval</abbr>, <abbr title="工具">tools</abbr>, and <abbr title="记忆">memory</abbr>. Our current models can <abbr title="主动使用">actively use</abbr> these <abbr title="能力">capabilities</abbr>—<abbr title="生成它们自己的搜索查询">generating their own search queries</abbr>, <abbr title="选择合适的工具">selecting appropriate tools</abbr>, and <abbr title="决定保留哪些信息">determining what information to retain</abbr>.
![The augmented LLM](https://resource.libx.fun/pic/2024/12/20241221101726639.png)

We recommend <abbr title="专注于">focusing on</abbr> two <abbr title="关键方面">key aspects</abbr> of the <abbr title="实施">implementation</abbr>: <abbr title="根据你的特定用例定制">tailoring these capabilities to your specific use case</abbr> and <abbr title="确保它们为你的大型语言模型提供简单，文档完善的界面">ensuring they provide an easy, well-documented interface for your LLM</abbr>. While there are many ways to <abbr title="实现这些增强">implement these augmentations</abbr>, one approach is through our recently released <abbr title="模型上下文协议">Model Context Protocol</abbr>, which allows developers to <abbr title="集成到日益增长的第三方工具生态系统中">integrate with a growing ecosystem of third-party tools</abbr> with a <abbr title="简单的客户端实现">simple client implementation</abbr>.

For the remainder of this post, we'll <abbr title="假设">assume</abbr> each LLM call has access to these <abbr title="增强能力">augmented capabilities</abbr>.

### Workflow: Prompt chaining
<abbr title="提示链接">Prompt chaining</abbr> <abbr title="将任务分解为一系列步骤">decomposes a task into a sequence of steps</abbr>, where each LLM call processes the <abbr title="前一个的输出">output of the previous one</abbr>. You can add <abbr title="程序化检查">programmatic checks</abbr> (see “gate” in the diagram below) on any <abbr title="中间步骤">intermediate steps</abbr> to <abbr title="确保过程仍在正轨上">ensure that the process is still on track</abbr>.

![The prompt chaining workflow](https://resource.libx.fun/pic/2024/12/20241221101852476.png)

When to use this workflow: This workflow is <abbr title="理想">ideal</abbr> for situations where the task can be <abbr title="容易且清晰地分解">easily and cleanly decomposed</abbr> into <abbr title="固定的子任务">fixed subtasks</abbr>. The main goal is to <abbr title="权衡延迟以获得更高的准确性">trade off latency for higher accuracy</abbr>, by making each LLM call an <abbr title="更容易的任务">easier task</abbr>.

**Examples where prompt chaining is useful**:

- <abbr title="生成营销文案，然后将其翻译成不同的语言">Generating Marketing copy, then translating it into a different language</abbr>.
- <abbr title="编写文档大纲，检查大纲是否符合某些标准，然后根据大纲编写文档">Writing an outline of a document, checking that the outline meets certain criteria, then writing the document based on the outline</abbr>.

### Workflow: Routing
<abbr title="路由">Routing</abbr> <abbr title="对输入进行分类">classifies an input</abbr> and <abbr title="将其定向到特定的后续任务">directs it to a specialized followup task</abbr>. This workflow allows for <abbr title="关注点分离">separation of concerns</abbr>, and <abbr title="构建更专业的提示">building more specialized prompts</abbr>. Without this workflow, <abbr title="优化一种输入">optimizing for one kind of input</abbr> can <abbr title="损害其他输入的性能">hurt performance on other inputs</abbr>.

![The routing workflow](https://resource.libx.fun/pic/2024/12/20241221102027407.png)

When to use this workflow: Routing works well for <abbr title="复杂任务">complex tasks</abbr> where there are <abbr title="不同的类别">distinct categories</abbr> that are better handled separately, and where <abbr title="分类可以准确处理">classification can be handled accurately</abbr>, either by an LLM or a more <abbr title="传统的分类模型/算法">traditional classification model/algorithm</abbr>.

**Examples where routing is useful**:

- <abbr title="将不同类型的客户服务查询（一般问题，退款请求，技术支持）定向到不同的下游流程，提示和工具">Directing different types of customer service queries (general questions, refund requests, technical support) into different downstream processes, prompts, and tools</abbr>.
- <abbr title="将简单/常见的问题路由到像Claude 3.5 Haiku这样的小型模型，将困难/不寻常的问题路由到像Claude 3.5 Sonnet这样更强大的模型，以优化成本和速度">Routing easy/common questions to smaller models like Claude 3.5 Haiku and hard/unusual questions to more capable models like Claude 3.5 Sonnet to optimize cost and speed</abbr>.

### Workflow: Parallelization
LLMs can sometimes work simultaneously on a task and have their outputs <abbr title="以编程方式聚合">aggregated programmatically</abbr>. This workflow, <abbr title="并行化">parallelization</abbr>, <abbr title="表现为">manifests in</abbr> two key variations:

- <abbr title="分段">Sectioning</abbr>: <abbr title="将任务分解为并行运行的独立子任务">Breaking a task into independent subtasks run in parallel</abbr>.
- <abbr title="投票">Voting</abbr>: <abbr title="多次运行同一任务以获得不同的输出">Running the same task multiple times to get diverse outputs</abbr>.

![The parallelization workflow](https://resource.libx.fun/pic/2024/12/20241221102308037.png)

When to use this workflow: <abbr title="并行化">Parallelization</abbr> is <abbr title="有效">effective</abbr> when the <abbr title="划分的子任务">divided subtasks</abbr> can be <abbr title="为了速度并行化">parallelized for speed</abbr>, or when <abbr title="需要多个视角或尝试">multiple perspectives or attempts are needed</abbr> for higher <abbr title="置信度结果">confidence results</abbr>. For <abbr title="复杂任务">complex tasks</abbr> with multiple considerations, LLMs generally perform better when each consideration is handled by a separate LLM call, allowing <abbr title="专注于每个特定方面">focused attention on each specific aspect</abbr>.

Examples where parallelization is useful:

- Sectioning:
  - <abbr title="实施保护措施，其中一个模型实例处理用户查询，而另一个模型实例筛选它们是否包含不适当的内容或请求。这往往比让同一个大型语言模型调用处理保护措施和核心响应效果更好">Implementing guardrails where one model instance processes user queries while another screens them for inappropriate content or requests. This tends to perform better than having the same LLM call handle both guardrails and the core response</abbr>.
  - <abbr title="自动化评估以评估大型语言模型的性能，其中每个大型语言模型调用评估模型在给定提示下性能的不同方面">Automating evals for evaluating LLM performance, where each LLM call evaluates a different aspect of the model’s performance on a given prompt</abbr>.
- Voting:
  - <abbr title="审查一段代码的漏洞，其中几个不同的提示审查并标记代码（如果发现问题）">Reviewing a piece of code for vulnerabilities, where several different prompts review and flag the code if they find a problem</abbr>.
  - <abbr title="评估给定内容是否不合适，使用多个提示评估不同方面或要求不同的投票阈值，以平衡假阳性和假阴性">Evaluating whether a given piece of content is inappropriate, with multiple prompts evaluating different aspects or requiring different vote thresholds to balance false positives and negatives</abbr>.

### Workflow: Orchestrator-workers
In the <abbr title="协调器-工作器">orchestrator-workers</abbr> workflow, a central LLM <abbr title="动态地分解任务">dynamically breaks down tasks</abbr>, <abbr title="将其委托给工作器大型语言模型">delegates them to worker LLMs</abbr>, and <abbr title="综合他们的结果">synthesizes their results</abbr>.

![The orchestrator-workers workflow](https://resource.libx.fun/pic/2024/12/20241221102452947.png)

When to use this workflow: This workflow is <abbr title="非常适合">well-suited</abbr> for <abbr title="复杂任务">complex tasks</abbr> where you can’t predict the <abbr title="需要的子任务">subtasks needed</abbr> (in coding, for example, the number of files that need to be changed and the nature of the change in each file likely depend on the task). Whereas it’s <abbr title="在地形上相似">topographically similar</abbr>, the key difference from <abbr title="并行化">parallelization</abbr> is its flexibility—subtasks aren't pre-defined, but determined by the <abbr title="协调器">orchestrator</abbr> based on the specific input.

**Example where <abbr title="协调器-工作器">orchestrator-workers</abbr> is useful**:

- <abbr title="编码产品，每次都对多个文件进行复杂更改">Coding products that make complex changes to multiple files each time</abbr>.
- <abbr title="搜索任务，涉及从多个来源收集和分析信息，以获取可能的相关信息">Search tasks that involve gathering and analyzing information from multiple sources for possible relevant information</abbr>.

### Workflow: Evaluator-optimizer
In the <abbr title="评估器-优化器">evaluator-optimizer</abbr> workflow, one LLM call <abbr title="生成响应">generates a response</abbr> while another provides <abbr title="评估和反馈">evaluation and feedback</abbr> in a loop.

![The evaluator-optimizer workflow](https://resource.libx.fun/pic/2024/12/20241221102612665.png)

When to use this workflow: This workflow is <abbr title="特别有效">particularly effective</abbr> when we have <abbr title="明确的评估标准">clear evaluation criteria</abbr>, and when <abbr title="迭代改进">iterative refinement</abbr> provides <abbr title="可衡量的价值">measurable value</abbr>. The two signs of good fit are, first, that LLM responses can be <abbr title="显著提高">demonstrably improved</abbr> when a human articulates their feedback; and second, that the LLM can provide such feedback. This is <abbr title="类似于">analogous to</abbr> the <abbr title="迭代写作过程">iterative writing process</abbr> a human writer might go through when producing a polished document.

**Examples where <abbr title="评估器-优化器">evaluator-optimizer</abbr> is useful**:

- <abbr title="文学翻译，其中存在翻译大型语言模型最初可能无法捕捉到的细微差别，但评估器大型语言模型可以提供有用的评论">Literary translation where there are nuances that the translator LLM might not capture initially, but where an evaluator LLM can provide useful critiques</abbr>.
- <abbr title="需要多轮搜索和分析以收集全面信息的复杂搜索任务，其中评估器决定是否有必要进行进一步搜索">Complex search tasks that require multiple rounds of searching and analysis to gather comprehensive information, where the evaluator decides whether further searches are warranted</abbr>.

### Agents
<abbr title="智能体">Agents</abbr> are <abbr title="正在生产环境中涌现">emerging in production</abbr> as LLMs mature in key capabilities—<abbr title="理解复杂输入">understanding complex inputs</abbr>, <abbr title="参与推理和计划">engaging in reasoning and planning</abbr>, <abbr title="可靠地使用工具">using tools reliably</abbr>, and <abbr title="从错误中恢复">recovering from errors</abbr>. Agents begin their work with either a command from, or interactive discussion with, the human user. Once the task is clear, agents plan and operate independently, potentially returning to the human for further information or judgement. During execution, it's <abbr title="至关重要的">crucial</abbr> for the agents to gain “<abbr title="真实情况">ground truth</abbr>” from the environment at each step (such as tool call results or code execution) to <abbr title="评估其进展">assess its progress</abbr>. Agents can then pause for human feedback at checkpoints or when encountering blockers. The task often terminates upon completion, but it’s also common to include <abbr title="停止条件">stopping conditions</abbr> (such as a maximum number of iterations) to maintain control.

Agents can handle <abbr title="复杂的任务">sophisticated tasks</abbr>, but their implementation is often straightforward. They are typically just LLMs using tools based on <abbr title="环境反馈">environmental feedback</abbr> in a loop. It is therefore crucial to design toolsets and their documentation clearly and thoughtfully. We expand on best practices for tool development in Appendix 2 ("<abbr title="提示工程你的工具">Prompt Engineering your Tools</abbr>").

![Autonomous agent](https://resource.libx.fun/pic/2024/12/20241221102757741.png)

When to use agents: Agents can be used for <abbr title="开放式问题">open-ended problems</abbr> where it’s difficult or impossible to predict the required number of steps, and where you can’t <abbr title="硬编码固定的路径">hardcode a fixed path</abbr>. The LLM will potentially operate for many turns, and you must have some level of trust in its decision-making. Agents' <abbr title="自主性">autonomy</abbr> makes them ideal for <abbr title="在受信任的环境中扩展任务">scaling tasks in trusted environments</abbr>.

The <abbr title="智能体的自主性">autonomous nature of agents</abbr> means higher costs, and the potential for <abbr title="复合错误">compounding errors</abbr>. We recommend <abbr title="在沙盒环境中进行广泛的测试">extensive testing in sandboxed environments</abbr>, along with the appropriate guardrails.

Examples where agents are useful:

The following examples are from our own implementations:

- A coding Agent to <abbr title="解决 SWE-bench 任务">resolve SWE-bench tasks</abbr>, which involve edits to many files based on a task description;
- Our “computer use” reference implementation, where Claude uses a computer to accomplish tasks.

![High-level flow of a coding agent](https://resource.libx.fun/pic/2024/12/20241221102845194.png)

### Combining and customizing these patterns
These <abbr title="构建模块">building blocks</abbr> aren't <abbr title="规定性的">prescriptive</abbr>. They're <abbr title="常见模式">common patterns</abbr> that developers can <abbr title="塑造和组合">shape and combine</abbr> to fit different use cases. The key to success, as with any LLM features, is <abbr title="衡量性能">measuring performance</abbr> and <abbr title="迭代实施">iterating on implementations</abbr>. To repeat: you should consider adding complexity only when it <abbr title="可以证明可以改善结果">demonstrably improves outcomes</abbr>.

## Summary
<abbr title="在大型语言模型领域的成功">Success in the LLM space</abbr> isn't about building the most sophisticated system. It's about building the right system for your needs. Start with simple prompts, optimize them with <abbr title="全面的评估">comprehensive evaluation</abbr>, and add <abbr title="多步骤代理系统">multi-step agentic systems</abbr> only when simpler solutions fall short.

When implementing agents, we try to follow three core principles:

1. <abbr title="保持智能体设计的简洁">Maintain simplicity in your agent's design</abbr>.
2. <abbr title="通过明确展示智能体的规划步骤来优先考虑透明度">Prioritize transparency by explicitly showing the agent’s planning steps</abbr>.
3. <abbr title="通过全面的工具文档和测试精心设计智能体-计算机界面 (ACI)">Carefully craft your agent-computer interface (ACI) through thorough tool documentation and testing</abbr>.
Frameworks can help you get started quickly, but don't hesitate to reduce <abbr title="抽象层">abstraction layers</abbr> and build with basic components as you move to production. By following these principles, you can create agents that are not only powerful but also reliable, maintainable, and trusted by their users.

### Acknowledgements
Written by Erik Schluntz and Barry Zhang. This work draws upon our experiences building agents at Anthropic and the valuable insights shared by our customers, for which we're deeply grateful.

## Appendix 1: Agents in practice
Our work with customers has revealed two particularly promising applications for AI agents that demonstrate the <abbr title="上述模式的实际价值">practical value of the patterns discussed above</abbr>. Both applications illustrate how agents add the most value for tasks that require both conversation and action, have clear success criteria, enable feedback loops, and integrate meaningful human oversight.

### A. Customer support
Customer support combines familiar chatbot interfaces with <abbr title="通过工具集成增强的功能">enhanced capabilities through tool integration</abbr>. This is a <abbr title="自然适合">natural fit</abbr> for more open-ended agents because:

- Support interactions naturally follow a conversation flow while requiring access to <abbr title="外部信息和操作">external information and actions</abbr>;
- Tools can be integrated to <abbr title="提取客户数据、订单历史和知识库文章">pull customer data, order history, and knowledge base articles</abbr>;
- Actions such as <abbr title="发出退款或更新工单">issuing refunds or updating tickets</abbr> can be handled programmatically; and
- Success can be clearly measured through <abbr title="用户定义的解决方案">user-defined resolutions</abbr>.
Several companies have demonstrated the <abbr title="这种方法的可行性">viability of this approach</abbr> through <abbr title="基于使用情况的定价模型">usage-based pricing models</abbr> that charge only for successful resolutions, showing confidence in their agents' effectiveness.

### B. Coding agents
The software development space has shown remarkable potential for LLM features, with capabilities evolving from code completion to <abbr title="自主问题解决">autonomous problem-solving</abbr>. Agents are particularly effective because:

- Code solutions are <abbr title="可通过自动化测试验证">verifiable through automated tests</abbr>;
- Agents can <abbr title="使用测试结果作为反馈来迭代解决方案">iterate on solutions using test results as feedback</abbr>;
- The problem space is well-defined and structured; and
- <abbr title="输出质量可以客观衡量">Output quality can be measured objectively</abbr>.
In our own implementation, agents can now solve real GitHub issues in the SWE-bench Verified benchmark based on the pull request description alone. However, whereas automated testing helps verify functionality, human review remains crucial for ensuring solutions align with broader system requirements.

## Appendix 2: Prompt engineering your tools
No matter which agentic system you're building, tools will likely be an important part of your agent. Tools enable Claude to interact with <abbr title="外部服务和API">external services and APIs</abbr> by specifying their exact structure and definition in our API. When Claude responds, it will include a tool use block in the API response if it plans to invoke a tool. Tool definitions and specifications should be given just as much prompt engineering attention as your overall prompts. In this brief appendix, we describe how to prompt engineer your tools.

There are often several ways to specify the same action. For instance, you can specify a file edit by writing a diff, or by rewriting the entire file. For structured output, you can return code inside markdown or inside JSON. In software engineering, differences like these are cosmetic and can be converted losslessly from one to the other. However, some formats are much more difficult for an LLM to write than others. Writing a diff requires knowing how many lines are changing in the chunk header before the new code is written. Writing code inside JSON (compared to markdown) requires extra escaping of newlines and quotes.

Our suggestions for deciding on tool formats are the following:

- <abbr title="给模型足够的令牌来“思考”，然后再自我陷入困境">Give the model enough tokens to "think" before it writes itself into a corner</abbr>.
- <abbr title="使格式接近模型在互联网文本中自然看到的格式">Keep the format close to what the model has seen naturally occurring in text on the internet</abbr>.
- <abbr title="确保没有格式“开销”，例如必须准确计算数千行代码或转义它编写的任何代码">Make sure there's no formatting "overhead" such as having to keep an accurate count of thousands of lines of code, or string-escaping any code it writes</abbr>.
One rule of thumb is to think about how much effort goes into human-computer interfaces (HCI), and plan to invest just as much effort in creating good agent-computer interfaces (ACI). Here are some thoughts on how to do so:

- <abbr title="把自己放在模型的角度考虑">Put yourself in the model's shoes</abbr>. Is it obvious how to use this tool, based on the description and parameters, or would you need to think carefully about it? If so, then it’s probably also true for the model. A good tool definition often includes example usage, edge cases, input format requirements, and clear boundaries from other tools.
- <abbr title="如何更改参数名称或描述以使事情更明显？">How can you change parameter names or descriptions to make things more obvious?</abbr> Think of this as writing a great docstring for a junior developer on your team. This is especially important when using many similar tools.
- <abbr title="测试模型如何使用您的工具：在我们的工作台中运行许多示例输入，以查看模型犯了哪些错误，并进行迭代">Test how the model uses your tools: Run many example inputs in our workbench to see what mistakes the model makes, and iterate</abbr>.
- <abbr title="防止错误发生">Poka-yoke your tools</abbr>. Change the arguments so that it is harder to make mistakes.

While building our agent for SWE-bench, we actually spent more time optimizing our tools than the overall prompt. For example, we found that the model would make mistakes with tools using relative filepaths after the agent had moved out of the root directory. To fix this, we changed the tool to always require absolute filepaths—and we found that the model used this method flawlessly.

