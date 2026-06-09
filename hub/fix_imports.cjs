const fs = require('fs');

const filesToFix = [
    'src/components/MascotAssistant.jsx',
    'src/pages/Dashboard.jsx',
    'src/pages/Login.jsx',
    'src/pages/Lounge.jsx',
    'src/pages/ModuleViewer.jsx',
    'src/pages/MyProjects.jsx',
    'src/pages/ProjectLab.jsx',
    'src/pages/ProjectPlanner.jsx',
    'src/pages/Classroom.jsx',
    'src/pages/AdminDashboard.jsx',
    'src/pages/AgentTestConsole.jsx',
    'src/pages/AgentHQ.jsx',
    'src/components/InterestTest.jsx'
];

for (const file of filesToFix) {
    if (!fs.existsSync(file)) continue;
    
    let content = fs.readFileSync(file, 'utf8');
    
    if (content.includes('motion.')) {
        if (!content.includes('import { motion } from') && !content.includes('import { motion,')) {
            if (content.includes("import { AnimatePresence } from 'framer-motion';")) {
                content = content.replace("import { AnimatePresence } from 'framer-motion';", "import { motion, AnimatePresence } from 'framer-motion';");
            } else if (content.includes('import { AnimatePresence } from "framer-motion";')) {
                content = content.replace('import { AnimatePresence } from "framer-motion";', 'import { motion, AnimatePresence } from "framer-motion";');
            } else {
                content = "import { motion } from 'framer-motion';\n" + content;
            }
            fs.writeFileSync(file, content);
            console.log(`Fixed: ${file}`);
        }
    }
}
