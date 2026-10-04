// Update social links and replace a coming-soon project with your own work.
// For a finished project: set comingSoon to false and add an https:// URL.
window.PORTFOLIO = {
  social: {
    instagram: 'https://www.instagram.com/azzzriieell',
    facebook: 'https://www.facebook.com/share/18c7eb9dKq/?mibextid=wwXIfr',
    github: 'https://github.com/azzzriieell00'
  },
  projects: [
    { title: 'Security lab', category: 'HACK4GOV REVIEWER', description: 'Kali Linux commands, investigation workflows, and practical review notes for my upcoming CTF competition.', tags: ['Hack4Gov', 'Review notes'], comingSoon: false, status: 'STUDY LAB', internal: true, linkLabel: 'Open review notes', url: 'security-lab.html' },
    { title: 'CTF write-ups', category: 'CAPTURE THE FLAG', description: 'A space for future challenge walkthroughs, problem-solving approaches, and lessons learned.', tags: ['CTF', 'Write-ups'], comingSoon: true, url: '' },
    { title: 'Software project', category: 'SOFTWARE ENGINEERING', description: 'My next build will live here: from the first idea to the code that brings it to life.', tags: ['Development', 'Builds'], comingSoon: true, url: '' }
  ],
  stack: [
    { title: 'Operating Systems', group: 'security', icon: 'terminal', items: ['Kali Linux', 'Parrot OS', 'BackBox Linux', 'Ubuntu'] },
    { title: 'Offensive Security Tools', group: 'security', icon: 'shield', items: ['Burp Suite', 'Metasploit', 'Nmap', 'Wireshark', 'Hashcat', 'John the Ripper'] },
    { title: 'Kali Linux Tools', group: 'security', icon: 'tool', items: ['Aircrack-ng', 'Hydra', 'Gobuster', 'Nikto', 'WPScan', 'Responder', 'BloodHound', 'Impacket'] },
    { title: 'Recon & Exploitation', group: 'security', icon: 'target', items: ['ffuf', 'Subfinder', 'httpx', 'Nuclei', 'SQLMap', 'Amass', 'gau'] },
    { title: 'Programming Languages', group: 'development', icon: 'code', items: ['Python', 'Bash', 'JavaScript', 'PHP', 'SQL', 'HTML5', 'CSS3'] },
    { title: 'Frameworks & DevOps', group: 'development', icon: 'layers', items: ['Flask', 'Docker', 'Git', 'Linux'] },
    { title: 'CTF Platforms', group: 'practice', icon: 'flag', items: ['TryHackMe', 'Hack The Box', 'picoCTF'] },
    { title: 'Learning & Certifications', group: 'practice', icon: 'award', items: ['Cisco Ethical Hacker', 'DICT Ethical Hacking', 'Data Science Essentials Python', 'CompTIA Data Analysis', 'DICT Python', 'Data Collection & Annotation'] }
  ]
};
