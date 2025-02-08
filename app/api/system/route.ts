import { NextResponse } from 'next/server';
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

        // const { stdout } = await execAsync("vcgencmd measure_temp");
        // return parseFloat(stdout.replace("temp=", "").replace("'C", ""));
        const { stdout } = await execAsync("cat /sys/class/thermal/thermal_zone0/temp")
        return parseFloat(stdout) / 1000
    } catch (error) {
        console.log('catch')
        console.error("Failed to get CPU temperature:", error);
        return 0;
    }
}


function bytesToGB(bytes: number) {
    return (bytes / (1024 * 1024 * 1024)).toFixed(2);
}

const getStorageData = async () => {
    if (os.platform() !== "linux") {
        return 0;
    }

    const { stdout } = await execAsync("df -h")
    const lines = stdout.trim().split("\n"); // แยกบรรทัด
    const data = lines.slice(1).map(line => {
        const values = line.split(/\s+/); // แยกค่าตามช่องว่าง
        return {
            filesystem: values[0],
            size: values[1],
            used: values[2],
            available: values[3],
            usePercent: values[4],
            mountedOn: values[5]
        };
    });

    return data.find((f) => f.filesystem === "/dev/sda2")
}

const getSystemDetail = async () => {
    // Get CPU usage
    const cpuUsage = getCpuUsage();

    // Get memory info
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;

    const cpuTemp = await getCpuTemp();
    const storageData = await getStorageData()

    return {
        hostname: os.hostname(),
        platform: os.platform(),
        arch: os.arch(),
        storage: storageData,
        cpuTemp,
        cpuUsage,
        memoryUsage: {
            total: parseFloat(bytesToGB(totalMem)),
            used: parseFloat(bytesToGB(usedMem)),
            free: parseFloat(bytesToGB(freeMem)),
        },
    };
}


export async function GET() {
    try {

        const data = await getSystemDetail()

        return NextResponse.json(
            { message: 'Data received successfully', data: { ...data }, statusCode: 200 },
            { status: 200 }
        );
    } catch (error) {
        console.log(error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}