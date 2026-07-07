

const fs = require('fs');
const files = [
  'd:/neutrontech_minimal_social_platform/neutrontech-app/app/settings/page.tsx',
  'd:/neutrontech_minimal_social_platform/neutrontech-app/app/search/page.tsx',
  'd:/neutrontech_minimal_social_platform/neutrontech-app/app/profile/page.tsx',
  'd:/neutrontech_minimal_social_platform/neutrontech-app/app/profile/[id]/page.tsx',
  'd:/neutrontech_minimal_social_platform/neutrontech-app/app/feed/page.tsx',
  'd:/neutrontech_minimal_social_platform/neutrontech-app/app/admin/layout.tsx'
];

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  
  // Replace the aside class
  content = content.replace(/<aside className="h-screen w-64 fixed left-0 top-0 hidden lg:flex flex-col bg-surface border-r border-outline-variant[^"]*">/g, 
    '<aside className="h-screen w-64 fixed left-0 top-0 hidden lg:flex flex-col bg-surface border-r border-outline-variant p-md pt-0 space-y-sm z-40">');
    
  // Replace the div holding the logo
  content = content.replace(/<div className="mb-lg">\s*<Link href="\/" className="inline-flex items-center gap-sm">/g,
    '<div className="h-16 flex items-center mb-sm">\n            <Link href="/" className="inline-flex items-center gap-sm">');

  fs.writeFileSync(file, content);
  console.log('Updated ' + file);
}
