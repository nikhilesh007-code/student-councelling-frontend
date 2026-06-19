import fs from 'fs';
import path from 'path';

const routesDir = 'src/routes';
const authDir = 'src/routes/_authenticated';

const dirsToMove = [
  'profile', 'recommendation', 'assessment', 'roadmap', 
  'assistant', 'progress', 'planner', 'placement', 
  'opportunities', 'mentorship', 'resume', 'resources', 'settings'
];

if (!fs.existsSync(authDir)) {
  fs.mkdirSync(authDir);
}

dirsToMove.forEach(dir => {
  const oldPath = path.join(routesDir, dir);
  const newPath = path.join(authDir, dir);
  
  if (fs.existsSync(oldPath)) {
    fs.renameSync(oldPath, newPath);
    console.log(`Moved ${dir} to _authenticated/${dir}`);
    
    // Fix imports in index.tsx
    const indexPath = path.join(newPath, 'index.tsx');
    if (fs.existsSync(indexPath)) {
      let content = fs.readFileSync(indexPath, 'utf-8');
      
      // Replace ../../components with ../../../components
      // Replace ../../lib with ../../../lib
      // Replace ../../services with ../../../services
      content = content.replace(/\.\.\/\.\.\/components/g, '../../../components');
      content = content.replace(/\.\.\/\.\.\/lib/g, '../../../lib');
      content = content.replace(/\.\.\/\.\.\/services/g, '../../../services');
      
      // Fix Route declaration
      content = content.replace(/createFileRoute\('\/([a-zA-Z0-9_-]+)\/'\)/g, "createFileRoute('/_authenticated/$1/')");
      
      fs.writeFileSync(indexPath, content);
      console.log(`Updated imports in _authenticated/${dir}/index.tsx`);
    }
  }
});
