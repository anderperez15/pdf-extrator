const extract = require("pdf-text-extract");
const fs = require("fs");


const planificacionPdf = '/home/hernan/test/PlanificacionHorarios.pdf';


extract(planificacionPdf,{ splitPages: false },(err, pages) => {
	if (err) {
		console.dir(err)
		return;
	}

	let h = pages.map(p => p.split('\n').map(a=>a.trim()).filter((a,b,c)=>{
		return 5 < b && b < (c.length - 3) && a !== "" && !/Asignatura*/.test(a);
	}).map(a=>a.split('  ')).map(n=>n.filter(a=>a !== '' && a.trim() !== 'a')
	.map(a=>a.trim())).map((a,b,c)=>{
		return a.length===8?a[0].split(' ').reduce((a,b,c)=>{
			if(c === 0){
				return [b]
			}
			return [a[0],a[1]?a[1]+' '+b:b]
		},[]).concat(a.slice(1,a.length)):a;
	})).reduce((a,b)=>a.concat(b),[]).map(a=>{
		if(a.length === 3){
			return [...a[0].split(' '),...a.slice(1,a.length)]
		}
		if(a.length === 6){
			if(a[0].length > 7){
				return [a[0].slice(0,7),a[0].slice(7).trim(),...a.slice(1,3),'S. A.','S. A.',...a.slice(3)];
			};
			if(a[2].length > 4){
				return [...a.slice(0,2),...a[2].split(' '),...a.slice(3)];
			};
		}
		if(a.length === 5){
			return [...a.slice(0,2),'S. A.','S. A.',...a.slice(2)]
		}
		return a;
	});
	let horario = [];
	let materia = [];
	let seccion = {};

	for(let i = 0; i < h.length; i++){
		switch(h[i].length){
			case 9:
				if(i === 0){
					seccion.codigo = h[i][0];
					seccion.asignatura = h[i][1];
					seccion.bloque = h[i][2];
					seccion.seccion = h[i][3];
					seccion.dia = [h[i][4]];
					seccion.aula = [h[i][5]];
					seccion.horas_entrada = [h[i][6]];
					seccion.horas_salida = [h[i][7]];
					seccion.profesor = h[i][8];
				} else{
					materia.push(seccion);
					horario.push(materia);
					materia = [];
					seccion = {};
					seccion.codigo = h[i][0];
					seccion.asignatura = h[i][1];
					seccion.bloque = h[i][2];
					seccion.seccion = h[i][3];
					seccion.dia = [h[i][4]];
					seccion.aula = [h[i][5]];
					seccion.horas_entrada = [h[i][6]];
					seccion.horas_salida = [h[i][7]];
					seccion.profesor = h[i][8];
				}

			break;
			case 7:
				materia.push(seccion);
				seccion = {};
				seccion.codigo = materia[materia.length - 1].codigo;
				seccion.asignatura = materia[materia.length - 1].asignatura;
				seccion.bloque = h[i][0];
				seccion.seccion = h[i][1];
				seccion.dia = [h[i][2]];
				seccion.aula = [h[i][3]];
				seccion.horas_entrada = [h[i][4]];
				seccion.horas_salida = [h[i][5]];
				seccion.profesor = h[i][6];
			break;
			default:
				seccion.dia = seccion.dia.concat([h[i][0]]);
				seccion.aula = seccion.aula.concat([h[i][1]]);
				seccion.horas_entrada = seccion.horas_entrada.concat([h[i][2]]);
				seccion.horas_salida = seccion.horas_salida.concat([h[i][3]]);
		}
	};
	fs.writeFile('horario-data.json',JSON.stringify([...new Set(horario.map(d=>d[0].dia).reduce((a,b)=>a.concat(b),[]))], null,'	'),(err)=>{
		if(err){
			console.log(err);
		} else {
			console.log('Se ha procesado todo con exito!');
		}
	});
});


