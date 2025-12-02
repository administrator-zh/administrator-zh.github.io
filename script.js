
// 🔴 替换成你的Gist信息（必须修改！）
const GIST_ID = "63ce6a9044216f19e314eccd66e50573"; // 创建Gist后地址栏的一串字符
const GITHUB_TOKEN = "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"; // 带gist权限的个人访问令牌
const DATA_FILE = "pbl-resource-data.json"; // 存储数据的文件名（无需修改）

// 页面加载时自动加载已提交的资料
window.onload = async () => {
    await loadResources();
};

// 加载Gist中的资料数据
async function loadResources() {
    try {
        const response = await fetch(`https://api.github.com/gists/${GIST_ID}`);
        if (!response.ok) throw new Error("加载失败");
        
        const gist = await response.json();
        const file = gist.files[DATA_FILE];
        const resources = file ? JSON.parse(file.content) : []; // 无数据时初始化为空数组
        
        renderResourceList(resources); // 渲染资料列表
    } catch (error) {
        alert("加载资料出错，请检查Gist信息是否正确！");
        console.error("加载失败原因：", error);
    }
}

// 渲染已提交的资料列表
function renderResourceList(resources) {
    const listContainer = document.getElementById("resourceList");
    listContainer.innerHTML = ""; // 清空列表
    
    // 按提交时间倒序排列（最新的在前面）
    resources.reverse().forEach((item, index) => {
        const resourceItem = document.createElement("div");
        resourceItem.className = "data-item";
        resourceItem.innerHTML = `
            <h3>${index + 1}. ${item.resourceTitle}</h3>
            <p><span class="label">整理员：</span>${item.name}</p >
            <p><span class="label">资料类型：</span>${item.resourceType}</p >
            <p><span class="label">来源：</span>${item.source}</p >
            <p><span class="label">有效性说明：</span>${item.validity}</p >
            <p><span class="label">备注：</span>${item.notes || "无"}</p >
        `;
        listContainer.appendChild(resourceItem);
    });
}

// 提交资料到Gist
async function submitResource() {
    // 获取表单数据
    const name = document.getElementById("name").value.trim();
    const resourceType = document.getElementById("resourceType").value;
    const resourceTitle = document.getElementById("resourceTitle").value.trim();
    const source = document.getElementById("source").value.trim();
    const validity = document.getElementById("validity").value.trim();
    const notes = document.getElementById("notes").value.trim();

    // 验证必填项
    if (!name || !resourceType || !resourceTitle || !source || !validity) {
        alert("带*的字段为必填项，请完整填写！");
        return;
    }

    try {
        // 1. 先获取Gist中已有的数据
        const getResponse = await fetch(`https://api.github.com/gists/${GIST_ID}`);
        const gist = await getResponse.json();
        const file = gist.files[DATA_FILE];
        const existingResources = file ? JSON.parse(file.content) : [];

        // 2. 添加新提交的资料（包含提交时间戳）
        const newResource = {
            name,
            resourceType,
            resourceTitle,
            source,
            validity,
            notes,
            submitTime: new Date().toLocaleString() // 记录提交时间（本地时间）
        };
        existingResources.push(newResource);

        // 3. 保存更新后的数据到Gist
        const saveResponse = await fetch(`https://api.github.com/gists/${GIST_ID}`, {
            method: "PATCH", // 更新Gist的请求方法
            headers: {
                "Authorization": `token ${GITHUB_TOKEN}`, // 身份验证
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                files: {
                    [DATA_FILE]: { content: JSON.stringify(existingResources, null, 2) } // 格式化JSON便于查看
                }
            })
        });

        if (saveResponse.ok) {
            alert("资料提交成功！");
            // 重置表单
            document.querySelectorAll("input, textarea, select").forEach(el => el.value = "");
            // 重新加载资料列表（显示最新数据）
            await loadResources();
        } else {
            throw new Error("保存失败");
        }
    } catch (error) {
        alert("提交出错，请重试！");
        console.error("提交失败原因：", error);
    }
}
