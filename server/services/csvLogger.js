import fs from "fs";
import path from "path";

const filePath =
path.join(process.cwd(), "leads.csv");

export async function logToCSV(
lead,
status
){

const row =
`${lead.name},
${lead.email},
${lead.company},
${new Date().toISOString()},
${status}\n`;

if(!fs.existsSync(filePath)){

fs.writeFileSync(
filePath,
"Name,Email,Company,Timestamp,Status\n"
);

}

fs.appendFileSync(
filePath,
row
);

console.log(
"[CSV] Lead logged"
);

}