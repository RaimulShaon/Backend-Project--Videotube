export const asyncHandaler = (fun)=> async (req, res, next ) => {
    try {
        fun(req, res, next)
    } catch (error) {
        res.status(500).json({ message: error, success: false })
    }
}