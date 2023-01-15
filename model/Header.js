import  mongoose from 'mongoose'

const HeaderSchema = new mongoose.Schema({
   headerImage: {type: String}

}, {timestamps: true}
)

export default mongoose.model('Header', HeaderSchema)