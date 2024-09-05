const express = require('express');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const asyncHandler = require('express-async-handler');

const app = express();
app.use(express.json());

const executeCode = asyncHandler(async (req, res) => {
    // console.log('Executing code...');
    const { code, language, input } = req.body;
    // console.log(code, language, input);
    if (!code) {
        return res.status(200).json({ msg: 'Code is required' , throwError: true});
    }
    if (!language) {
        return res.status(200).json({ msg: 'Language is required' , throwError: true});
    }

    let codeFileName = '';
    let compileCommand = '';
    let runCommand = '';
    const langExt = {
        c: 'c',
        'c++': 'cpp',
        java: 'java',
        python: 'py',
    };

    if (language === 'java') {
        // Extract the main class name from the Java code
        const classNameMatch = code.match(/class\s+(\w+)/);
        if (classNameMatch) {
            const className = classNameMatch[1];
            codeFileName = `${className}.java`;
        } else {
            return res.status(200).json({ msg: 'Java class name not found in code' , throwError: true});
        }
    } else {
        codeFileName = `code.${langExt[language]}`;
    }

    // codepath is the path of the file where the code will be stored
    //the code will be stored in the file with the name codeFileName
    const codePath = path.join(__dirname, codeFileName);
    fs.writeFileSync(codePath, code);

    const inputFileName = 'input.txt';
    const inputPath = path.join(__dirname, inputFileName);
    fs.writeFileSync(inputPath, input);

    const outputFileName = 'output.txt';
    const outputPath = path.join(__dirname, outputFileName);
    // console.log('Paths:', codePath, inputPath, outputPath);

    switch (language) {
        case 'c':
            compileCommand = `gcc ${codeFileName} -o ${path.basename(codeFileName, '.c')}.out`;
            runCommand = `./${path.basename(codeFileName, '.c')}.out < ${inputFileName} > ${outputFileName}`;
            break;

        case 'c++':
            compileCommand = `g++ ${codeFileName} -o ${path.basename(codeFileName, '.cpp')}.out`;
            runCommand = `./${path.basename(codeFileName, '.cpp')}.out < ${inputFileName} > ${outputFileName}`;
            break;

        case 'java':
            compileCommand = `javac ${codeFileName}`;
            runCommand = `java ${path.basename(codeFileName, '.java')} < ${inputFileName} > ${outputFileName}`;
            break;

        case 'python':
            runCommand = `python ${codeFileName} < ${inputFileName} > ${outputFileName}`;
            break;

        default:
            return res.status(200).json({ msg: 'Invalid language' , throwError: true});
    }

    // console.log('Commands:', compileCommand, runCommand);

    let stdErr = '';

    const execute = (command, callback) => {
        exec(command, { cwd: __dirname }, (error, stdout, stderr) => {
            if (stderr) {
                // console.error('stderr:', stderr);
                stdErr += stderr;
            }
            if (error) {
                // console.error('1error:', error);
                const errorText = "Error signal : " + error.signal;
                return callback(stderr || errorText);
            }
            callback(null, stdout);
        });
    };

    if (compileCommand) {
        execute(compileCommand, (compileError) => {
            // console.log('Compile error:', compileError);
            if (compileError) {
                return res.status(200).json({ error : compileError , output: ''});
            }
            execute(runCommand, (runError) => {
                if (runError) {
                    // console.log('Error:', runError);
                    return res.status(200).json({ error : runError , output: ''});
                }
                // console.log('Code executed successfully');
                const output = fs.readFileSync(outputPath, 'utf-8');
                res.status(200).json({ output , error: stdErr});
            });
        });
    } else {
        execute(runCommand, (runError) => {
            if (runError) {
                return res.status(200).json({ error : runError , output: ''});
            }
            const output = fs.readFileSync(outputPath, 'utf-8');
            res.status(200).json({ output , error : stdErr });
        });
    }
});

app.post('/execute', executeCode);

const PORT = 5002;
app.listen(PORT, () => {
    console.log(`Executor service running on port ${PORT}`);
});
