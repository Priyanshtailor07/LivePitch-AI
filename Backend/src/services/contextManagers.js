class ContextManager{
    constructor(){
            this.contexts = new Map();
    }

    addChunks(userId,text){
        if(!this.sessions .has(userId)){
            this.sessions.set(userId,[]);
        }

        const userHistory=this.sessions.get(userId);
        userHistory.push({
            text:text.trim(),
            timestamp:Date.now()
        });    

    }

    getContext(userId){

        if(!this.sessions.has(userId)){
            return '';
        }
        const now=Date.now();
        const thirtySecondsAgo=now-30000;
        // Filtering the history to keep only segments spoken within the 30-second boundary
        const activeChunks=this.sessions.get(userId).filter(chunk=>chunk.timestamp>=thirtySecondsAgo);

        // Combining the recent text arrays back into a single clean paragraph
        return activeChunks.map(chunk => chunk.text).join(' ');

    }
        clearSession(userId){
            this.sessions.delete(userId);
        }
}


export default ContextManager=new ContextManager();