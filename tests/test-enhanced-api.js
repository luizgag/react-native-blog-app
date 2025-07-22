// Test to verify the enhanced API service is working correctly
const { enhancedApiService } = require('./src/services/enhancedApiService');

console.log('Testing Enhanced API Service...');

// Check if all required methods exist
const requiredMethods = [
  'getPosts',
  'getPost', 
  'searchPosts',
  'createPost',
  'updatePost',
  'deletePost',
  'getComments',
  'createComment',
  'updateComment',
  'deleteComment',
  'toggleLike',
  'getLikes',
  'removeLike',
  'getUser',
  'login',
  'logout',
  'register'
];

console.log('\n🔍 Checking if all required methods exist:');

let allMethodsExist = true;
for (const method of requiredMethods) {
  if (typeof enhancedApiService[method] === 'function') {
    console.log(`✅ ${method}: exists`);
  } else {
    console.log(`❌ ${method}: missing or not a function`);
    allMethodsExist = false;
  }
}

if (allMethodsExist) {
  console.log('\n✅ All required methods exist in enhancedApiService');
} else {
  console.log('\n❌ Some methods are missing from enhancedApiService');
}

// Check for any extra methods that might be causing issues
console.log('\n🔍 All available methods in enhancedApiService:');
const allMethods = Object.getOwnPropertyNames(Object.getPrototypeOf(enhancedApiService))
  .filter(name => name !== 'constructor' && typeof enhancedApiService[name] === 'function');

allMethods.forEach(method => {
  console.log(`- ${method}`);
});

console.log('\n✅ Enhanced API Service test completed');