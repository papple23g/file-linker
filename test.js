const { exec } = require('child_process');

// 測試檔案路徑
const filePath = 'C:\\Users\\pappl\\我的雲端硬碟\\個人筆記\\_話題集錦.txt';
// const filePath = "C:\\Program Files\\Everything\\Everything.exe";

// 測試不同的開啟命令
const commands = [
    // `cmd.exe /c start "" "${filePath}"`,
    // `explorer "${filePath}"`,
    `start "" "${filePath}"`,
    // `cmd /c start "" "${filePath}"`,
    // `"${filePath}"`
];

// 測試每個命令
commands.forEach((cmd, index) => {
    console.log(`\n測試命令 ${index + 1}:`, cmd);
    exec(cmd, (error, stdout, stderr) => {
        if (error) {
            console.log(`錯誤:`, error.message);
            return;
        }
        if (stderr) {
            console.log(`stderr:`, stderr);
            return;
        }
        console.log(`成功執行命令`);
        if (stdout) console.log(`stdout:`, stdout);
    });
});
