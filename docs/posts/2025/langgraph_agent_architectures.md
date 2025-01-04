---
title: Agent architectures
description: LangGraph针对Agent的一些阐述
tag:
 - LLM
 - LangGraph
 - Agent
recommend: 5
hidden: false
sticky: 1
author: LangGraph
cover: https://resource.libx.fun/pic/2025/01/20250105032832395.png
date: 2025-01-05
---
# LangGraph - Agent architectures

Many LLM applications <abbr title="实现一个特定的控制流程">implement a particular control flow</abbr> of steps before and / or after LLM calls. As an example, RAG performs <abbr title="检索与用户问题相关的文档">retrieval of documents relevant to a user question</abbr>, and passes those documents to an LLM in order to <abbr title="在提供的文档上下文中使模型的响应有依据">ground the model's response in the provided document context</abbr>.

Instead of <abbr title="硬编码固定的控制流程">hard-coding a fixed control flow</abbr>, we sometimes want LLM systems that can <abbr title="选择它们自己的控制流程">pick their own control flow</abbr> to solve more complex problems! This is one definition of an agent: an agent is a system that uses an LLM to <abbr title="决定一个应用程序的控制流程">decide the control flow of an application</abbr>. There are many ways that an LLM can <abbr title="控制应用程序">control application</abbr>:

- An LLM can <abbr title="在两个潜在路径之间路由">route between two potential paths</abbr>
- An LLM can decide which of many <abbr title="工具调用">tools to call</abbr>
- An LLM can decide whether the <abbr title="生成的答案">generated answer</abbr> is <abbr title="足够了">sufficient</abbr> or more work is needed
As a result, there are many different types of <abbr title="代理架构">agent architectures</abbr>, which give an LLM <abbr title="不同程度的控制">varying levels of control</abbr>.

![](https://resource.libx.fun/pic/2025/01/20250105024724178.png)


## Router
A router allows an LLM to <abbr title="从一组指定的选项中选择一个步骤">select a single step from a specified set of options</abbr>. This is an agent architecture that exhibits a <abbr title="相对有限的控制水平">relatively limited level of control</abbr> because the LLM usually focuses on making a single decision and produces a specific output from <abbr title="有限的预定义选项集">limited set of pre-defined options</abbr>. Routers typically employ a few different concepts to achieve this.

### Structured Output
<abbr title="具有LLM的结构化输出">Structured outputs with LLMs</abbr> work by <abbr title="提供一个特定的格式或模式">providing a specific format or schema</abbr> that the LLM should follow in its response. This is similar to tool calling, but more general. While tool calling typically involves selecting and using predefined functions, structured outputs can be used for any type of formatted response. Common methods to achieve structured outputs include:

1. <abbr title="提示工程">Prompt engineering</abbr>: Instructing the LLM to respond in a specific format via the system prompt.
2. <abbr title="输出解析器">Output parsers</abbr>: Using <abbr title="后处理">post-processing</abbr> to extract structured data from LLM responses.
3. <abbr title="工具调用">Tool calling</abbr>: Leveraging built-in tool calling capabilities of some LLMs to generate structured outputs.
Structured outputs are crucial for routing as they ensure the LLM's decision can be <abbr title="被系统可靠地解释并执行">reliably interpreted and acted upon by the system</abbr>. Learn more about structured outputs in this how-to guide.

## Tool calling agent
While a router allows an LLM to make a single decision, more complex agent architectures <abbr title="扩展了LLM的控制">expand the LLM's control</abbr> in two key ways:

1. <abbr title="多步骤决策">Multi-step decision making</abbr>: The LLM can make a series of decisions, one after another, instead of just one.
2. <abbr title="工具访问">Tool access</abbr>: The LLM can choose from and use a variety of tools to accomplish tasks.
ReAct is a popular <abbr title="通用代理架构">general purpose agent architecture</abbr> that combines these expansions, integrating three core concepts.

1. <abbr title="工具调用">Tool calling</abbr>: Allowing the LLM to select and use various tools as needed.
2. <abbr title="记忆">Memory</abbr>: Enabling the agent to retain and use information from previous steps.
3. <abbr title="规划">Planning</abbr>: Empowering the LLM to create and follow <abbr title="多步骤计划">multi-step plans</abbr> to achieve goals.
This architecture allows for more complex and flexible agent behaviors, going beyond simple routing to enable <abbr title="具有多个步骤的动态问题解决">dynamic problem-solving with multiple steps</abbr>. You can use it with create_react_agent.

### Tool calling
Tools are useful whenever you want an agent to <abbr title="与外部系统交互">interact with external systems</abbr>. External systems (e.g., APIs) often require a particular <abbr title="输入模式或有效负载">input schema or payload</abbr>, rather than natural language. When we <abbr title="绑定一个API">bind an API</abbr>, for example, as a tool, we give the model <abbr title="对所需输入模式的感知">awareness of the required input schema</abbr>. The model will choose to call a tool based upon the natural language input from the user and it will return an output that <abbr title="遵守工具所需的模式">adheres to the tool's required schema</abbr>.

Many LLM providers support tool calling and tool calling interface in LangChain is simple: you can simply pass any Python `function` into `ChatModel.bind_tools(function)`.
![](https://resource.libx.fun/pic/2025/01/20250105025032726.png)

### Memory
<abbr title="记忆对于智能体至关重要">Memory is crucial for agents</abbr>, enabling them to retain and utilize information across multiple steps of problem-solving. It operates on different scales:

1. <abbr title="短期记忆">Short-term memory</abbr>: Allows the agent to access information acquired during earlier steps in a sequence.
2. <abbr title="长期记忆">Long-term memory</abbr>: Enables the agent to recall information from previous interactions, such as past messages in a conversation.
LangGraph provides <abbr title="对内存实现的完全控制">full control over memory implementation</abbr>:

- <abbr title="状态">State</abbr>: User-defined schema specifying the exact structure of memory to retain.
- <abbr title="检查点">Checkpointers</abbr>: Mechanism to store state at every step across different interactions.
This flexible approach allows you to <abbr title="根据你特定的代理架构需求定制内存系统">tailor the memory system to your specific agent architecture needs</abbr>. For a practical guide on adding memory to your graph, see this tutorial.

<abbr title="有效的内存管理">Effective memory management</abbr> enhances an agent's ability to maintain context, learn from past experiences, and make more informed decisions over time.

### Planning
In the ReAct architecture, an LLM is called repeatedly in a while-loop. At each step the agent decides which tools to call, and what the inputs to those tools should be. Those tools are then executed, and the outputs are fed back into the LLM as observations. The while-loop terminates when the agent decides it has enough information to <abbr title="解决用户请求">solve the user request</abbr> and it is not worth calling any more tools.

### ReAct implementation
There are several differences between [this](https://arxiv.org/abs/2210.03629) paper and the pre-built [`create_react_agent`](https://langchain-ai.github.io/langgraph/reference/prebuilt/#langgraph.prebuilt.chat_agent_executor.create_react_agent) <abbr title="实现">implementation</abbr>:

- First, we use [tool-calling](https://langchain-ai.github.io/langgraph/concepts/agentic_concepts/#tool-calling) to have LLMs <abbr title="调用工具">call tools</abbr>, whereas the paper used <abbr title="提示和解析原始输出">prompting + parsing of raw output</abbr>. This is because tool calling did not exist when the paper was written, but is generally better and more <abbr title="可靠">reliable</abbr>.
- Second, we use <abbr title="消息">messages</abbr> to <abbr title="提示LLM">prompt the LLM</abbr>, whereas the paper used string formatting. This is because at the time of writing, LLMs didn't even expose a message-based interface, whereas now that's the only interface they expose.
- Third, the paper required all <abbr title="工具的输入">inputs to the tools</abbr> to be a single string. This was largely due to LLMs not being super capable at the time, and only really being able to <abbr title="生成单个输入">generate a single input</abbr>. Our <abbr title="实现">implementation</abbr> allows for using tools that require multiple inputs.
- Fourth, the paper only looks at <abbr title="一次调用一个工具">calling a single tool at the time</abbr>, largely due to limitations in LLMs performance at the time. Our <abbr title="实现">implementation</abbr> allows for <abbr title="一次调用多个工具">calling multiple tools at a time</abbr>.
- Finally, the paper asked the LLM to explicitly generate a "Thought" step before <abbr title="决定调用哪些工具">deciding which tools to call</abbr>. This is the "Reasoning" part of "ReAct". Our <abbr title="实现">implementation</abbr> does not do this by default, largely because LLMs have gotten much better and that is not as necessary. Of course, if you wish to <abbr title="提示这样做">prompt it do so</abbr>, you certainly can.

## Custom agent architectures

While routers and tool-calling agents (like ReAct) are common, <abbr title="定制智能体架构">customizing agent architectures</abbr> often <abbr title="导致更好的表现">leads to better performance</abbr> for specific tasks. LangGraph offers several powerful features for <abbr title="构建定制的智能体系统">building tailored agent systems</abbr>:

### Human-in-the-loop

Human involvement can significantly <abbr title="提高智能体的可靠性">enhance agent reliability</abbr>, especially for <abbr title="敏感的任务">sensitive tasks</abbr>. This can involve:

- <abbr title="批准特定的动作">Approving specific actions</abbr>
- <abbr title="提供反馈以更新智能体的状态">Providing feedback to update the agent's state</abbr>
- <abbr title="在复杂决策过程中提供指导">Offering guidance in complex decision-making processes</abbr>

Human-in-the-loop patterns are crucial when <abbr title="完全自动化">full automation</abbr> isn't <abbr title="可行的">feasible</abbr> or <abbr title="理想的">desirable</abbr>. Learn more in our <abbr title="人机回路指南">human-in-the-loop guide</abbr>.

### Parallelization

Parallel processing is <abbr title="至关重要的">vital</abbr> for <abbr title="高效的多智能体系统">efficient multi-agent systems</abbr> and <abbr title="复杂的任务">complex tasks</abbr>. LangGraph supports parallelization through its Send API, enabling:

- <abbr title="多个状态的并行处理">Concurrent processing of multiple states</abbr>
- <abbr title="实现类似map-reduce的操作">Implementation of map-reduce-like operations</abbr>
- <abbr title="高效处理独立的子任务">Efficient handling of independent subtasks</abbr>

For practical implementation, see our <abbr title="map-reduce教程">map-reduce tutorial</abbr>.

### Subgraphs

Subgraphs are essential for <abbr title="管理复杂的智能体架构">managing complex agent architectures</abbr>, particularly in <abbr title="多智能体系统">multi-agent systems</abbr>. They allow:

- <abbr title="单个智能体的独立状态管理">Isolated state management for individual agents</abbr>
- <abbr title="智能体团队的层级组织">Hierarchical organization of agent teams</abbr>
- <abbr title="智能体与主系统之间的受控通信">Controlled communication between agents and the main system</abbr>

Subgraphs communicate with the parent graph through overlapping keys in the state schema. This enables flexible, <abbr title="模块化的智能体设计">modular agent design</abbr>. For implementation details, refer to our <abbr title="子图指南">subgraph how-to guide</abbr>.

### Reflection

Reflection mechanisms can significantly <abbr title="提高智能体的可靠性">improve agent reliability</abbr> by:

1. <abbr title="评估任务的完成情况和正确性">Evaluating task completion and correctness</abbr>
2. <abbr title="提供反馈以进行迭代改进">Providing feedback for iterative improvement</abbr>
3. <abbr title="启用自我纠正和学习">Enabling self-correction and learning</abbr>

While often LLM-based, reflection can also use <abbr title="确定的方法">deterministic methods</abbr>. For instance, in coding tasks, compilation errors can serve as feedback. This approach is demonstrated in <abbr title="此视频使用LangGraph进行自我纠正代码生成">this video using LangGraph for self-corrective code generation</abbr>.

By leveraging these features, LangGraph enables the creation of <abbr title="复杂的，针对特定任务的智能体架构">sophisticated, task-specific agent architectures</abbr> that can handle <abbr title="复杂的工作流程">complex workflows</abbr>, <abbr title="有效协作">collaborate effectively</abbr>, and <abbr title="持续提高其性能">continuously improve their performance</abbr>.
