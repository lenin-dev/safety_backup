const fs = require('fs-extra');
const path = require('path');
const archiver = require('archiver');
const cron = require('cron');
const logsPath = './logs.txt';

// Función para copiar archivos y crear un ZIP
async function copyAndCompress() {
    const sourceDir = '/ruta/del/directorio/origen'; // Cambia esta ruta
    const targetDir = '/ruta/del/directorio/destino'; // Cambia esta ruta
    const zipFileName = `backup_${new Date().toISOString().split('T')[0]}.zip`;
    const zipFilePath = path.join(targetDir, zipFileName);

    try {
        // Asegurar que el directorio de destino existe
        await fs.ensureDir(targetDir);

        // Crear el archivo ZIP
        const output = fs.createWriteStream(zipFilePath);
        const archive = archiver('zip', { zlib: { level: 9 } });

        output.on('close', () => {
            fs.writeFile(logsPath, `[${new Date()}]: Backup completado: ${zipFilePath} (${archive.pointer()} bytes)\n`, 'utf8');
        });

        archive.on('error', (err) => {
            throw err;
        });

        archive.pipe(output);

        // Agregar los archivos del directorio origen al archivo ZIP
        archive.directory(sourceDir, false);

        await archive.finalize();
    } catch (err) {
        fs.writeFile(logsPath, `[${new Date()}]: Error al copiar y comprimir archivos: ${err}\n`, 'utf8');
    }
}

// Programar la tarea con cron
const job = new cron.CronJob(
    '30 14 * * 6', // Sábados a las 2:30 PM
    () => {
        fs.writeFile(logsPath, `[${new Date()}]: Ejecutando tarea programada...\n`, 'utf8');
        copyAndCompress();
    },
    null,
    true,
    'America/Mexico_City' // Cambia a tu zona horaria si es necesario
);

fs.writeFile(logsPath, `[${new Date()}]: Tarea programada activa.\n`, 'utf8');
