const { User } = require('../models');
const { AuthenticationError } = require('apollo-server-express');
const { signToken } = require('../utils/auth');

const resolvers = {

  Query: {

    me: async (parent, args, context) => {
      if (context.user) {
        const userData = await User.findOne({ _id: context.user._id })
          .select('-__v -password')
          .populate('saveBooks')

        return userData;
      }

      throw new AuthenticationError('Not logged in');
    },
    users: async () => {
      return User.find();

    },
  },
  Mutation: {
    addUser: async (parent, args) => {
      const user = await User.create(args);
      const token = signToken(user);

      return { token, user };
    },

    login: async (parent, { email, password }) => {
      const user = await User.findOne({ email });

      if (!user) {
        throw new AuthenticationError('Incorrect credentials');
      }

      const correctPw = await user.isCorrectPassword(password);

      if (!correctPw) {
        throw new AuthenticationError('Incorrect credentials');
      }

      const token = signToken(user);
      return { token, user };
    },

    saveBook: async (parent, { book }, context) => {
      
      if (context.user) {
        const updUSer =  await User.findByIdAndUpdate(       
          { _id: context.user._id},
          { $push: { savedBooks: book } },
          { new: true }
         
        )
        return updUSer;
      }
    },

    removeBook: async (parent, { bookId }, context) => {
     console.log('server remove',context.user._id,bookId)
      if (context.user) {     
        const remove = await User.findOneAndUpdate(
          { _id:context.user._id},
          { $pull: { savedBooks: {bookId } } },
          { new: true }
        )
        return remove;
      }
    }

  }


};

module.exports = resolvers;