local M = {}

local last_ctx = nil
local function find_exchange_file()
    -- Priority 1: Current working directory (monorepo usage)
    local local_path = vim.fn.getcwd() .. "/native-host/exchange.json"
    if vim.fn.filereadable(local_path) == 1 then return local_path end
    
    -- Priority 2: Standard project structure relative to this script
    local script_path = debug.getinfo(1).source:sub(2)
    local project_root = vim.fn.fnamemodify(script_path, ":h:h:h:h")
    local standard_path = project_root .. "/native-host/exchange.json"
    if vim.fn.filereadable(standard_path) == 1 then return standard_path end

    return local_path -- Fallback to CWD
end

local options = {
    path = find_exchange_file(),
    silent = false,
}

-- Function to read and parse the exchange file
local function update_context(is_initial)
    local f = io.open(options.path, "r")
    if not f then return end
    
    local content = f:read("*all")
    f:close()

    if not content or content == "" then return end

    local ok, data = pcall(vim.fn.json_decode, content)
    if ok and data then
        last_ctx = data
        if not options.silent or is_initial then
            vim.notify("🌉 BridgeContext Synced: " .. data.name, vim.log.levels.INFO, { title = "BridgeContext" })
        end
    end
end

-- Setup file watcher
function M.setup(opts)
    if opts then
        for k, v in pairs(opts) do options[k] = v end
    end

    local w = vim.loop.new_fs_event()
    local parent = vim.fn.fnamemodify(options.path, ":h")
    
    if vim.fn.isdirectory(parent) == 1 then
        w:start(parent, {}, vim.schedule_wrap(function(err, fname)
            if fname == "exchange.json" then
                -- Add a small delay for atomic rename to complete
                vim.defer_fn(function() update_context(false) end, 100)
            end
        end))
    end

    -- Initial load
    update_context(true)

    -- Commands
    vim.api.nvim_create_user_command("BridgeContext", M.show_context, {})
    vim.api.nvim_create_user_command("BridgeInject", M.inject_context, {})
end

-- Show context in a floating window
function M.show_context()
    if not last_ctx then
        print("No active BridgeContext found.")
        return
    end

    local buf = vim.api.nvim_create_buf(false, true)
    local lines = {
        "BRIDGE CONTEXT: " .. last_ctx.name,
        "-------------------",
        last_ctx.desc,
        "",
        "DATA:",
        "----",
    }
    for line in last_ctx.data:gmatch("[^\r\n]+") do
        table.insert(lines, line)
    end

    vim.api.nvim_buf_set_lines(buf, 0, -1, false, lines)
    
    local width = 60
    local height = 15
    vim.api.nvim_open_win(buf, true, {
        relative = "editor",
        width = width,
        height = height,
        col = (vim.o.columns - width) / 2,
        row = (vim.o.lines - height) / 2,
        style = "minimal",
        border = "rounded"
    })
end

-- Inject context at cursor
function M.inject_context()
    if not last_ctx then
        print("No context to inject.")
        return
    end
    local current_pos = vim.api.nvim_win_get_cursor(0)
    local line = current_pos[1] - 1
    local col = current_pos[2]

    local lines = {}
    for l in last_ctx.data:gmatch("[^\r\n]+") do
        table.insert(lines, l)
    end
    
    vim.api.nvim_buf_set_text(0, line, col, line, col, lines)
    vim.notify("Context injected from Bridge!", vim.log.levels.INFO)
end

return M
