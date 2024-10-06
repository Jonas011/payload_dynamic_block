const fs = require('fs');
const path = require('path');

// Just works in the main folder of the project
const blockName = 'Sample';

// Will create a new Payload block schema
const GET_PAYLOAD_SCHEMA = (name) => {
    return `
import { Block } from 'payload/types';

export const ${name}Block: Block = {
    slug: '${name}',
    graphQL: {
        singularName: '${name}Block',
    },
    fields: [
        {
            name: 'title',
            type: 'text',
            required: true,
        },
        {
            name: 'content',
            type: 'textarea',
        },
    ],
}
`
};

// Will create a new client-side component
const CLIENT_SIDE_COMPONENT = (name) => {
    return `
import React from 'react';

const ${name}Block = (props) => {
    const {title} = props;
    return (
        <div>
            <h1>${name} Block {title}</h1>
            <p>This is the ${name} block component.</p>
        </div>
    );
};

export default ${name}Block;
`
};

// Will create a new GraphQL block definition
const GET_GRAPHQL_BLOCK = (blockName) => {
    return `
export const ${blockName.toUpperCase()}_BLOCK = \`
...on ${blockName}Block {
  blockType
  title
  content
}
\`
`
};

const updatePagesCollection = (blockName) => {
    const pagesFilePath = path.join(__dirname, '.', 'src', 'payload', 'collections', 'Pages', 'index.ts');
    const fileContent = fs.readFileSync(pagesFilePath, 'utf8');

    const blocksArrayRegex = /blocks:\s*\[([^\]]*)\]/;
    const match = fileContent.match(blocksArrayRegex);

    if (match) {
        const blocksArrayContent = match[1].trim();

        // Check if the block already exists in the blocks array
        if (blocksArrayContent.includes(`${blockName}Block`)) {
            console.log(`Block ${blockName} already exists in the Pages collection.`);
            return;
        }

        const newBlocksArrayContent = `${blocksArrayContent}, ${blockName}Block`;
        const updatedFileContent = fileContent.replace(blocksArrayRegex, `blocks: [${newBlocksArrayContent}]`);

        const importStatement = `import { ${blockName}Block } from '../../blocks/${blockName}Block';\n`;

        // Only add import if it doesn't exist
        if (!fileContent.includes(importStatement.trim())) {
            fs.writeFileSync(pagesFilePath, importStatement + updatedFileContent);
            console.log(`Updated ${pagesFilePath} with new block: ${blockName}`);
        } else {
            fs.writeFileSync(pagesFilePath, updatedFileContent);
            console.log(`Block ${blockName} added to the Pages collection.`);
        }
    } else {
        console.error('Could not find blocks array in Pages collection file.');
    }
};

const createPayloadBlock = (name) => {
    const dirPath = path.join(__dirname, '.', 'src', 'payload', 'blocks', `${name}Block`);
    const filePath = path.join(dirPath, 'index.ts');

    if (fs.existsSync(filePath)) {
        console.log(`Block ${name} already exists.`);
        return;
    }

    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }

    const schemaContent = GET_PAYLOAD_SCHEMA(name);

    fs.writeFileSync(filePath, schemaContent.trim());
    console.log(`Created ${filePath}`);
};

const createAppBlock = (name) => {
    const dirPath = path.join(__dirname, '.', 'src', 'app', '_blocks', `${name}Block`);
    const filePath = path.join(dirPath, 'index.tsx');

    if (fs.existsSync(filePath)) {
        console.log(`App block ${name} already exists.`);
        return;
    }

    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }

    const componentContent = CLIENT_SIDE_COMPONENT(name);

    fs.writeFileSync(filePath, componentContent.trim());
    console.log(`Created ${filePath}`);
};

const updateGraphQLBlocks = (blockName) => {
    const blocksFilePath = path.join(__dirname, '.', 'src', 'app', '_graphql', 'blocks.ts');
    const fileContent = fs.readFileSync(blocksFilePath, 'utf8');

    const newBlockDefinition = GET_GRAPHQL_BLOCK(blockName);

    if (fileContent.includes(`${blockName.toUpperCase()}_BLOCK`)) {
        console.log(`GraphQL block ${blockName} already exists.`);
        return;
    }

    fs.appendFileSync(blocksFilePath, '\n\n');
    fs.appendFileSync(blocksFilePath, newBlockDefinition.trim());
    console.log(`Updated ${blocksFilePath} with new GraphQL block: ${blockName}`);
};

const updateBlockComponents = (blockName) => {
    const componentsFilePath = path.join(__dirname, '.', 'src', 'app', '_components', 'Blocks', 'index.tsx');
    const fileContent = fs.readFileSync(componentsFilePath, 'utf8');

    const importStatement = `import ${blockName}Block from '../../_blocks/${blockName}Block';\n`;
    const blockComponentsRegex = /const blockComponents = \{([^}]*)\}/;
    const match = fileContent.match(blockComponentsRegex);

    if (match) {
        const blockComponentsContent = match[1].trim();

        // Check if the block already exists in the blockComponents object
        if (blockComponentsContent.includes(`${blockName}: ${blockName}Block`)) {
            console.log(`Block ${blockName} already exists in the blockComponents object.`);
            return;
        }

        const newBlockComponentsContent = `${blockComponentsContent}, ${blockName}: ${blockName}Block`;
        const updatedFileContent = fileContent.replace(blockComponentsRegex, `const blockComponents = {${newBlockComponentsContent}}`);

        // Only add import if it doesn't exist
        if (!fileContent.includes(importStatement.trim())) {
            fs.writeFileSync(componentsFilePath, importStatement + updatedFileContent);
            console.log(`Updated ${componentsFilePath} with new block component: ${blockName}`);
        } else {
            fs.writeFileSync(componentsFilePath, updatedFileContent);
            console.log(`Block ${blockName} added to the blockComponents object.`);
        }
    } else {
        console.error('Could not find blockComponents object in components file.');
    }
};

const updateGraphQLPages = (blockName) => {
    console.log("-----------------");
    const pagesFilePath = path.join(__dirname, '.', 'src', 'app', '_graphql', 'pages.ts');
    const fileContent = fs.readFileSync(pagesFilePath, 'utf8');

    const importRegex = /import\s*{[^}]*}\s*from\s*['"]\.\/blocks'/;




    const match = fileContent.match(importRegex);
    console.log(match[0]);
    if (match) {
        const importContent = match[0].match(/{([^}]*)}/)[1].trim();

        // Check if the block already exists in the import statement
        if (importContent.includes(`${blockName.toUpperCase()}_BLOCK`)) {
            console.log(`GraphQL block ${blockName} already exists in the import statement.`);
            return;
        }

        const newImportContent = `${importContent}, ${blockName.toUpperCase()}_BLOCK`;
        const updatedFileContentWithImport = fileContent.replace(importRegex, `import { ${newImportContent} } from './blocks';`);

        const newBlockDefinition = `\n          ${'$'}{${blockName.toUpperCase()}_BLOCK`;

        if (fileContent.includes(`${blockName.toUpperCase()}_BLOCK`)) {
            console.log(`GraphQL block ${blockName} already exists in Pages GraphQL.`);
            return;
        }

        const layoutRegex = /layout\s*{([^}]*)}/;
        const layoutMatch = updatedFileContentWithImport.match(layoutRegex);

        if (layoutMatch) {
            const layoutContent = layoutMatch[1].trim();
            console.log(layoutContent);
            const newLayoutContent = `\n\t\t\t\t\t${layoutContent}} ${newBlockDefinition}`;
            const updatedFileContent = updatedFileContentWithImport.replace(layoutRegex, `layout {${newLayoutContent}}`);

            fs.writeFileSync(pagesFilePath, updatedFileContent);
            console.log(`Updated ${pagesFilePath} with new GraphQL block: ${blockName}`);
        } else {
            console.error('Could not find layout in pages GraphQL file.');
        }
    } else {
        console.error('Could not find import statement in pages GraphQL file.');
    }
};


const addNewBlock = (blockName) => {
    createPayloadBlock(blockName);
    updatePagesCollection(blockName);
    createAppBlock(blockName);
    updateGraphQLBlocks(blockName);
    updateBlockComponents(blockName);
    updateGraphQLPages(blockName);
};


addNewBlock(blockName);
