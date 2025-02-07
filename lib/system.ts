import os from "os";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

function getCpuUsage() {
    const cpus = os.cpus();
    return cpus.map((cpu) => {
        const total = Object.values(cpu.times).reduce((acc, tv) => acc + tv, 0);
        const usage = 100 - (100 * cpu.times.idle) / total;
        return usage.toFixed(1);
    });
}

async function getCpuTemp() {
    console.log("os.platform() : ", os.platform())
    if (os.platform() !== "linux") {
        return 0; // หรือค่า default อะไรก็ได้ เช่น 0
    }

    try {
        console.log('try')

        const { stdout } = await execAsync("vcgencmd measure_temp");
        return parseFloat(stdout.replace("temp=", "").replace("'C", ""));
    } catch (error) {
        console.log('catch')
        console.error("Failed to get CPU temperature:", error);
        return 0;
    }
}

async function getCpuData() {
    console.log("os.platform() : ", os.platform())
    if (os.platform() == "linux") {
        try {
            const tdata = await execAsync("vcgencmd measure_temp")
            return JSON.stringify(tdata)
        } catch (error) {
            console.error("Failed to get CPU temperature:", error);
            return JSON.stringify(error)
        }

    }
    else {
        return "else"
    }
}

function bytesToGB(bytes: number) {
    return (bytes / (1024 * 1024 * 1024)).toFixed(2);
}

export async function getSystemDetails() {
    // Get CPU usage
    const cpuUsage = getCpuUsage();

    // Get memory info
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;

    const cpuTemp = await getCpuTemp();

    return {
        os,
        cpuTemp,
        cpuUsage,
        memoryUsage: {
            total: parseFloat(bytesToGB(totalMem)),
            used: parseFloat(bytesToGB(usedMem)),
            free: parseFloat(bytesToGB(freeMem)),
        },
        getCpuData
    };
}
