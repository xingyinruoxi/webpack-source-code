module.exports=class Webpack{
	constructor(options){
		const {entry,output}=options;
		this.$entry=entry;
		this.$output=output;
		console.log('options',options)
	}
	run(){
		console.log('==========================');
	}
}