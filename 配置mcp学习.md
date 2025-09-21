
放入./codex/config.toml文件中

# --- MCP servers added by Codex CLI ---
[mcp_servers.context7]
command = "npx"
args = ["-y", "@upstash/context7-mcp@latest"]

[mcp_servers.sequential-thinking]
command = "npx"
args = ["-y", "@modelcontextprotocol/server-sequential-thinking"]

[mcp_servers.playwright]
command = "npx"
args = ["@playwright/mcp@latest"]

[mcp_servers.mcp-server-time]
command = "uvx"
args = ["mcp-server-time", "--local-timezone=Asia/Shanghai"]

[mcp_servers.mcp-shrimp-task-manager]
command = "npx"
args = ["-y", "mcp-shrimp-task-manager"]
env = { DATA_DIR = "/Users/lostsheep/tools/mcp-shrimp-task-manager/data", TEMPLATES_USE = "zh", ENABLE_GUI = "false" }

[mcp_servers.mcp-deepwiki]
command = "npx"
args = ["-y", "mcp-deepwiki@latest"]

[mcp_servers.desktop-commander]
command = "npx"
args = ["-y", "@wonderwhy-er/desktop-commander"]
# --- End MCP servers ---

## 大佬二

# ~/.codex/config.toml
# —— 基础：Codex 会从该文件读取 [mcp_servers] 并启动 STDIO MCP —— 

#######################################################################
# 1) Filesystem（读写项目文件；建议限制到你的项目根目录）
#######################################################################
# 用“绝对路径”限制访问范围（多项目可重复写多行路径）
[mcp_servers.filesystem]
command = "npx"
args = ["-y", "@modelcontextprotocol/server-filesystem", "/ABS/PATH/TO/your-project"]
# 参考：支持通过传参声明允许目录，也可由支持“Roots”的客户端动态控制。 
# 文档：@modelcontextprotocol/server-filesystem（npm） 以及 README 中的 npx 示例。
# 替换成你的真实项目路径，例如：/Users/you/dev/myapp
# 你也可以按项目使用项目级 .codex/config.toml
# ——> codex --config ./.codex/config.toml
#######################################################################

#######################################################################
# 2) GitHub（管理仓库/PR/Issue；需 GitHub PAT）
#######################################################################
# 方式A：本地二进制（推荐给 Codex，走 STDIO）
[mcp_servers.github]
# 若用自编译或发布的二进制：github-mcp-server stdio
command = "/ABS/PATH/TO/github-mcp-server"
args = ["stdio"]
# 最小权限 PAT：只开你需要的 scopes（如 repo / issues 按需）
env = { GITHUB_PERSONAL_ACCESS_TOKEN = "ghp_xxx" }
# 可选：精简可用工具集，减少干扰（全部可用则删掉这行）
# env.GITHUB_TOOLSETS = "repos,issues,pull_requests"

# 方式B：Docker（如果你不想放二进制在本机 PATH）
# [mcp_servers.github]
# command = "docker"
# args = ["run","-i","--rm",
#         "-e","GITHUB_PERSONAL_ACCESS_TOKEN",
#         "ghcr.io/github/github-mcp-server"]
# env = { GITHUB_PERSONAL_ACCESS_TOKEN = "ghp_xxx" }
#######################################################################

#######################################################################
# 3) Context7（拉取最新版生态文档到上下文，降低“过期 API”）
#######################################################################
[mcp_servers.context7]
command = "npx"
args = ["-y", "@upstash/context7-mcp"]
# 默认即可用；需要时再在对话里提示它检索对应库/框架文档。
#######################################################################

#######################################################################
# 4) Commands / Shell（在安全审批下跑测试/构建/脚本）
#######################################################################
[mcp_servers.shell]
command = "npx"
args = ["-y", "mcp-server-commands"]
# 提示：此服务“能跑命令”，务必依赖 Codex/IDE 的逐条审批；
# 建议只在项目目录内使用，并避免破坏性命令。
#######################################################################

#######################################################################
# 5) Playwright（浏览器自动化 / 生成与回放 E2E）
#######################################################################
[mcp_servers.playwright]
command = "npx"
args = ["@playwright/mcp@latest"]
# 如首次报“未安装浏览器”，可让模型调用其自带的 browser_install 工具安装。
#######################################################################